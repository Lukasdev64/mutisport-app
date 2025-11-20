-- =====================================================
-- MIGRATION: anonymous_tournaments → tournaments V2
-- =====================================================
-- This script migrates data from the JSONB-based anonymous_tournaments
-- table to the new normalized schema (tournaments, tournament_players,
-- tournament_matches, tournament_rounds).
--
-- IMPORTANT: Run TOURNAMENTS_V2_SCHEMA.sql FIRST to create new tables!
--
-- Steps:
-- 1. Backup existing data
-- 2. Migrate tournaments metadata
-- 3. Extract and migrate players from JSONB
-- 4. Extract and migrate matches from bracket_data JSONB
-- 5. Create rounds (for Swiss/Round-robin)
-- 6. Verify data integrity
-- 7. (Optional) Drop old table
--
-- Estimated time: ~1-5 minutes depending on data volume
-- =====================================================

-- =====================================================
-- STEP 0: SAFETY CHECKS
-- =====================================================

DO $$
BEGIN
  -- Check if old table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'anonymous_tournaments') THEN
    RAISE EXCEPTION 'Table anonymous_tournaments does not exist. Nothing to migrate.';
  END IF;

  -- Check if new tables exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournaments') THEN
    RAISE EXCEPTION 'New tournaments table does not exist. Run TOURNAMENTS_V2_SCHEMA.sql first!';
  END IF;

  RAISE NOTICE 'Safety checks passed. Starting migration...';
END $$;

-- =====================================================
-- STEP 1: BACKUP EXISTING DATA
-- =====================================================

-- Create backup table (keep for rollback)
DROP TABLE IF EXISTS anonymous_tournaments_backup CASCADE;
CREATE TABLE anonymous_tournaments_backup AS
SELECT * FROM anonymous_tournaments;

RAISE NOTICE 'Created backup table: anonymous_tournaments_backup';

-- =====================================================
-- STEP 2: MIGRATE TOURNAMENTS METADATA
-- =====================================================

-- Disable triggers temporarily for bulk insert
ALTER TABLE tournaments DISABLE TRIGGER ALL;

INSERT INTO tournaments (
  id,
  name,
  location,
  tournament_date,
  description,
  format,
  sport,
  players_count,
  status,
  current_round,
  total_rounds,
  unique_url_code,
  edit_token_hash,
  owner_id,
  is_public,
  views_count,
  last_viewed_at,
  expires_at,
  created_at,
  updated_at
)
SELECT
  id,
  name,
  location,
  tournament_date,
  NULL, -- description (didn't exist in old schema)
  format,
  'tennis', -- Default sport (old schema didn't have this)
  players_count,
  status,
  1, -- current_round (will be calculated later)
  CASE
    WHEN format = 'single_elimination' THEN CEIL(LOG(2, players_count))::INT
    WHEN format = 'double_elimination' THEN CEIL(LOG(2, players_count))::INT + 1
    WHEN format = 'round_robin' THEN players_count - 1
    WHEN format = 'swiss' THEN LEAST(CEIL(LOG(2, players_count))::INT, 7)
    ELSE NULL
  END, -- total_rounds estimate
  unique_url_code,
  NULL, -- edit_token_hash (will be generated for security)
  organizer_id, -- Maps to owner_id
  true, -- is_public (all old tournaments were public)
  views_count,
  last_viewed_at,
  expires_at,
  created_at,
  updated_at
FROM anonymous_tournaments
WHERE id IS NOT NULL;

-- Re-enable triggers
ALTER TABLE tournaments ENABLE TRIGGER ALL;

RAISE NOTICE 'Migrated % tournaments', (SELECT COUNT(*) FROM tournaments);

-- =====================================================
-- STEP 3: EXTRACT AND MIGRATE PLAYERS FROM JSONB
-- =====================================================

-- Temporary table to extract players
CREATE TEMP TABLE temp_players AS
SELECT
  gen_random_uuid() AS id,
  t.id AS tournament_id,
  jsonb_array_elements_text(t.players_names) AS name,
  row_number() OVER (PARTITION BY t.id ORDER BY jsonb_array_elements_text(t.players_names)) AS position
FROM anonymous_tournaments t
WHERE t.players_names IS NOT NULL;

-- Insert players
INSERT INTO tournament_players (id, tournament_id, name, seed)
SELECT
  id,
  tournament_id,
  name,
  NULL -- No seeding info in old data
FROM temp_players;

RAISE NOTICE 'Migrated % players', (SELECT COUNT(*) FROM tournament_players);

-- =====================================================
-- STEP 4: EXTRACT AND MIGRATE MATCHES FROM JSONB
-- =====================================================

-- This is complex because bracket_data structure differs by format
-- We'll use a PL/pgSQL function to parse each tournament's bracket

CREATE OR REPLACE FUNCTION migrate_tournament_matches()
RETURNS void AS $$
DECLARE
  tournament_rec RECORD;
  round_rec RECORD;
  match_rec RECORD;
  player1_name TEXT;
  player2_name TEXT;
  winner_name TEXT;
  player1_id UUID;
  player2_id UUID;
  winner_id UUID;
  match_id UUID;
BEGIN
  -- Loop through each tournament
  FOR tournament_rec IN
    SELECT id, format, bracket_data
    FROM anonymous_tournaments
    WHERE bracket_data IS NOT NULL
  LOOP
    -- Extract rounds array
    FOR round_rec IN
      SELECT
        (round_data->>'round')::INT AS round_number,
        round_data->>'name' AS round_name,
        round_data->'matches' AS matches
      FROM jsonb_array_elements(tournament_rec.bracket_data->'rounds') AS round_data
    LOOP
      -- Extract matches from this round
      FOR match_rec IN
        SELECT
          match_data->>'match_id' AS old_match_id,
          match_data->>'player1' AS player1,
          match_data->>'player2' AS player2,
          match_data->>'winner' AS winner,
          match_data->>'next_match_id' AS next_match_id
        FROM jsonb_array_elements(round_rec.matches) AS match_data
      LOOP
        -- Get player IDs from names
        player1_name := match_rec.player1;
        player2_name := match_rec.player2;
        winner_name := match_rec.winner;

        -- Lookup player1
        IF player1_name IS NOT NULL AND player1_name != 'BYE' THEN
          SELECT tp.id INTO player1_id
          FROM tournament_players tp
          WHERE tp.tournament_id = tournament_rec.id AND tp.name = player1_name
          LIMIT 1;
        ELSE
          player1_id := NULL;
        END IF;

        -- Lookup player2
        IF player2_name IS NOT NULL AND player2_name != 'BYE' THEN
          SELECT tp.id INTO player2_id
          FROM tournament_players tp
          WHERE tp.tournament_id = tournament_rec.id AND tp.name = player2_name
          LIMIT 1;
        ELSE
          player2_id := NULL;
        END IF;

        -- Lookup winner
        IF winner_name IS NOT NULL AND winner_name != '' THEN
          SELECT tp.id INTO winner_id
          FROM tournament_players tp
          WHERE tp.tournament_id = tournament_rec.id AND tp.name = winner_name
          LIMIT 1;
        ELSE
          winner_id := NULL;
        END IF;

        -- Insert match
        INSERT INTO tournament_matches (
          tournament_id,
          round_number,
          match_number,
          bracket_type,
          player1_id,
          player2_id,
          winner_id,
          status,
          completed_at
        ) VALUES (
          tournament_rec.id,
          round_rec.round_number,
          (SELECT COUNT(*) + 1 FROM tournament_matches WHERE tournament_id = tournament_rec.id AND round_number = round_rec.round_number),
          'main', -- Default (we don't have bracket_type in old data)
          player1_id,
          player2_id,
          winner_id,
          CASE WHEN winner_id IS NOT NULL THEN 'completed' ELSE 'pending' END,
          CASE WHEN winner_id IS NOT NULL THEN NOW() ELSE NULL END
        )
        RETURNING id INTO match_id;

      END LOOP; -- matches
    END LOOP; -- rounds
  END LOOP; -- tournaments

  RAISE NOTICE 'Migrated matches for all tournaments';
END;
$$ LANGUAGE plpgsql;

-- Execute migration function
SELECT migrate_tournament_matches();

-- Cleanup
DROP FUNCTION migrate_tournament_matches();

RAISE NOTICE 'Migrated % matches', (SELECT COUNT(*) FROM tournament_matches);

-- =====================================================
-- STEP 5: CREATE ROUNDS (for Swiss/Round-robin)
-- =====================================================

-- Generate rounds based on existing matches
INSERT INTO tournament_rounds (tournament_id, round_number, name, status)
SELECT DISTINCT
  tm.tournament_id,
  tm.round_number,
  'Round ' || tm.round_number,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM tournament_matches m2
      WHERE m2.tournament_id = tm.tournament_id
        AND m2.round_number = tm.round_number
        AND m2.status = 'pending'
    ) THEN 'pending'
    ELSE 'completed'
  END
FROM tournament_matches tm
ORDER BY tm.tournament_id, tm.round_number;

RAISE NOTICE 'Created % rounds', (SELECT COUNT(*) FROM tournament_rounds);

-- =====================================================
-- STEP 6: UPDATE CURRENT_ROUND IN TOURNAMENTS
-- =====================================================

-- Set current_round to the first incomplete round (or last round if all complete)
UPDATE tournaments t
SET current_round = COALESCE(
  (
    SELECT MIN(round_number)
    FROM tournament_rounds tr
    WHERE tr.tournament_id = t.id AND tr.status != 'completed'
  ),
  (
    SELECT MAX(round_number)
    FROM tournament_rounds tr
    WHERE tr.tournament_id = t.id
  ),
  1
);

-- =====================================================
-- STEP 7: CALCULATE PLAYER STATISTICS
-- =====================================================

-- Update matches_played, matches_won, matches_lost
UPDATE tournament_players tp
SET
  matches_played = (
    SELECT COUNT(*)
    FROM tournament_matches tm
    WHERE (tm.player1_id = tp.id OR tm.player2_id = tp.id)
      AND tm.status = 'completed'
  ),
  matches_won = (
    SELECT COUNT(*)
    FROM tournament_matches tm
    WHERE tm.winner_id = tp.id
      AND tm.status = 'completed'
  ),
  matches_lost = (
    SELECT COUNT(*)
    FROM tournament_matches tm
    WHERE (tm.player1_id = tp.id OR tm.player2_id = tp.id)
      AND tm.winner_id IS NOT NULL
      AND tm.winner_id != tp.id
      AND tm.status = 'completed'
  ),
  points = (
    SELECT COUNT(*)
    FROM tournament_matches tm
    WHERE tm.winner_id = tp.id
      AND tm.status = 'completed'
  );

-- =====================================================
-- STEP 8: DATA INTEGRITY CHECKS
-- =====================================================

DO $$
DECLARE
  old_count INT;
  new_count INT;
  player_count INT;
  match_count INT;
BEGIN
  SELECT COUNT(*) INTO old_count FROM anonymous_tournaments;
  SELECT COUNT(*) INTO new_count FROM tournaments;
  SELECT COUNT(*) INTO player_count FROM tournament_players;
  SELECT COUNT(*) INTO match_count FROM tournament_matches;

  RAISE NOTICE '================================';
  RAISE NOTICE 'MIGRATION SUMMARY';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Tournaments: % → %', old_count, new_count;
  RAISE NOTICE 'Players: %', player_count;
  RAISE NOTICE 'Matches: %', match_count;
  RAISE NOTICE '================================';

  IF old_count != new_count THEN
    RAISE WARNING 'Tournament count mismatch! Some tournaments may not have migrated.';
  END IF;

  IF player_count = 0 THEN
    RAISE WARNING 'No players migrated! Check players_names JSONB format in old data.';
  END IF;

  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Backup table: anonymous_tournaments_backup';
  RAISE NOTICE '================================';
END $$;

-- =====================================================
-- STEP 9: GENERATE EDIT TOKENS FOR MIGRATED TOURNAMENTS
-- =====================================================

-- For security, we need to generate edit tokens for anonymous tournaments
-- Since we can't recover the original tokens, we'll need to regenerate them
-- The organizer/user will need to claim their tournament via email or other means

DO $$
DECLARE
  tournament_rec RECORD;
  new_token TEXT;
BEGIN
  FOR tournament_rec IN
    SELECT id, unique_url_code
    FROM tournaments
    WHERE owner_id IS NULL AND edit_token_hash IS NULL
  LOOP
    -- Generate a random token (32 chars)
    new_token := encode(gen_random_bytes(24), 'base64');

    -- Hash it with a salt (simulating bcrypt)
    -- NOTE: In production, use proper bcrypt via pg_crypto extension
    UPDATE tournaments
    SET edit_token_hash = crypt(new_token, gen_salt('bf'))
    WHERE id = tournament_rec.id;

    -- Log the token (REMOVE THIS IN PRODUCTION - tokens should be sent to users!)
    RAISE NOTICE 'Tournament % (code: %) - New edit token: %',
      tournament_rec.id,
      tournament_rec.unique_url_code,
      new_token;
  END LOOP;
END $$;

RAISE NOTICE 'Generated edit tokens for % anonymous tournaments',
  (SELECT COUNT(*) FROM tournaments WHERE owner_id IS NULL);

-- =====================================================
-- STEP 10: (OPTIONAL) DROP OLD TABLE
-- =====================================================

-- UNCOMMENT ONLY AFTER VERIFYING MIGRATION SUCCESS

-- DROP TABLE IF EXISTS anonymous_tournaments CASCADE;
-- RAISE NOTICE 'Dropped old anonymous_tournaments table';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (IF NEEDED)
-- =====================================================

-- If migration fails, run:
/*
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS tournament_players CASCADE;
DROP TABLE IF EXISTS tournament_matches CASCADE;
DROP TABLE IF EXISTS tournament_rounds CASCADE;

ALTER TABLE anonymous_tournaments_backup RENAME TO anonymous_tournaments;

-- Then investigate the error and fix before re-running
*/

-- =====================================================
-- POST-MIGRATION TASKS
-- =====================================================

-- 1. Notify users of new edit tokens (if anonymous tournaments exist)
-- 2. Update application code to use new service layer
-- 3. Test tournament creation, match updates, bracket rendering
-- 4. Monitor performance and optimize indexes if needed
-- 5. Set up cron job for cleanup_expired_tournaments()

-- =====================================================
-- END OF MIGRATION
-- =====================================================
