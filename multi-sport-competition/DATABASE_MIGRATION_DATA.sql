-- ============================================================================
-- DATA MIGRATION SCRIPT - competitions & anonymous_tournaments → tournaments
-- ============================================================================
-- Version: 1.0.0
-- Date: 2025-01-20
-- Purpose: Migrate existing data from legacy tables to unified tournaments schema
--
-- PREREQUISITES:
-- 1. DATABASE_MIGRATION_UNIFIED.sql must be executed first
-- 2. Full backup created
-- 3. Tested in staging environment
--
-- ESTIMATED TIME: 10-30 minutes depending on data volume
-- ============================================================================

-- ============================================================================
-- PHASE 1: MIGRATE DATA FROM 'competitions' TABLE
-- ============================================================================

BEGIN;

DO $$
DECLARE
  competition_record RECORD;
  new_tournament_id UUID;
  participant_record RECORD;
  file_record RECORD;
  migration_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting migration from competitions table...';

  -- Loop through all competitions
  FOR competition_record IN
    SELECT * FROM competitions ORDER BY created_at
  LOOP
    BEGIN
      -- Generate unique_url_code if not exists
      IF competition_record.unique_url_code IS NULL OR competition_record.unique_url_code = '' THEN
        competition_record.unique_url_code := LOWER(REGEXP_REPLACE(competition_record.name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || SUBSTRING(MD5(competition_record.id::text), 1, 8);
      END IF;

      -- Insert into tournaments table
      INSERT INTO tournaments (
        id,
        unique_url_code,
        organizer_id,
        name,
        description,
        sport,
        format,
        max_participants,
        current_participants,
        location,
        address,
        city,
        postal_code,
        country,
        date,
        age_category,
        is_official,
        is_public,
        status,
        cover_image_url,
        created_at,
        updated_at,
        legacy_competition_id
      ) VALUES (
        gen_random_uuid(), -- New UUID
        competition_record.unique_url_code,
        competition_record.organizer_id,
        competition_record.name,
        competition_record.description,
        competition_record.sport,
        'single-elimination', -- Default format for legacy competitions
        COALESCE(competition_record.max_participants, 16),
        COALESCE(competition_record.current_participants, 0),
        NULL, -- location (will be constructed from address)
        competition_record.address,
        competition_record.city,
        competition_record.postal_code,
        COALESCE(competition_record.country, 'France'),
        competition_record.date,
        COALESCE(competition_record.age_category, 'both'),
        COALESCE(competition_record.is_official, false),
        true, -- is_public (default true)
        CASE
          WHEN competition_record.date < CURRENT_DATE THEN 'completed'
          WHEN competition_record.date = CURRENT_DATE THEN 'ongoing'
          ELSE 'upcoming'
        END,
        competition_record.cover_image_url,
        competition_record.created_at,
        competition_record.updated_at,
        competition_record.id -- Store original ID
      ) RETURNING id INTO new_tournament_id;

      migration_count := migration_count + 1;
      RAISE NOTICE 'Migrated competition: % → tournament: %', competition_record.id, new_tournament_id;

      -- Migrate participants
      FOR participant_record IN
        SELECT p.*, pr.full_name, pr.email
        FROM participants p
        LEFT JOIN profiles pr ON p.user_id = pr.id
        WHERE p.competition_id = competition_record.id
      LOOP
        INSERT INTO tournament_players (
          tournament_id,
          name,
          email,
          profile_id,
          status,
          created_at,
          updated_at
        ) VALUES (
          new_tournament_id,
          COALESCE(participant_record.full_name, 'Player'),
          participant_record.email,
          participant_record.user_id,
          CASE participant_record.status
            WHEN 'confirmed' THEN 'confirmed'
            WHEN 'pending' THEN 'pending'
            WHEN 'rejected' THEN 'rejected'
            WHEN 'cancelled' THEN 'withdrawn'
            ELSE 'confirmed'
          END,
          participant_record.created_at,
          participant_record.updated_at
        );
      END LOOP;

      -- Migrate files
      FOR file_record IN
        SELECT * FROM competition_files WHERE competition_id = competition_record.id
      LOOP
        INSERT INTO tournament_files (
          tournament_id,
          file_name,
          file_path,
          file_size,
          file_type,
          storage_bucket,
          storage_path,
          uploaded_by,
          uploaded_at,
          category
        ) VALUES (
          new_tournament_id,
          file_record.file_name,
          file_record.file_path,
          file_record.file_size,
          file_record.file_type,
          'competition-files', -- Legacy bucket name
          file_record.file_path,
          file_record.uploaded_by,
          file_record.uploaded_at,
          'document' -- Default category
        );
      END LOOP;

    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error migrating competition %: %', competition_record.id, SQLERRM;
        -- Continue with next record
    END;
  END LOOP;

  RAISE NOTICE 'Completed migration from competitions: % records migrated', migration_count;
END $$;

COMMIT;

-- ============================================================================
-- PHASE 2: MIGRATE DATA FROM 'anonymous_tournaments' TABLE
-- ============================================================================

BEGIN;

DO $$
DECLARE
  anon_record RECORD;
  new_tournament_id UUID;
  player_record JSONB;
  match_record JSONB;
  round_record JSONB;
  new_round_id UUID;
  new_player_id UUID;
  player_id_map JSONB := '{}'::jsonb;
  migration_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting migration from anonymous_tournaments table...';

  -- Loop through all anonymous tournaments
  FOR anon_record IN
    SELECT * FROM anonymous_tournaments ORDER BY created_at
  LOOP
    BEGIN
      -- Insert into tournaments table
      INSERT INTO tournaments (
        id,
        unique_url_code,
        organizer_id,
        name,
        description,
        sport,
        format,
        max_participants,
        current_participants,
        date,
        status,
        is_public,
        bracket_data,
        match_results,
        created_at,
        updated_at,
        completed_at,
        legacy_anonymous_id
      ) VALUES (
        gen_random_uuid(),
        anon_record.unique_url_code,
        anon_record.organizer_id, -- Can be NULL
        anon_record.name,
        NULL, -- No description in anonymous tournaments
        COALESCE(anon_record.sport, 'Tennis'),
        anon_record.format,
        COALESCE((anon_record.bracket_data->>'max_participants')::integer, 16),
        COALESCE((anon_record.bracket_data->'players')::jsonb ? 'length', 0),
        COALESCE(anon_record.date, CURRENT_DATE),
        CASE
          WHEN anon_record.status = 'completed' THEN 'completed'
          WHEN anon_record.status = 'in_progress' THEN 'ongoing'
          ELSE 'upcoming'
        END,
        true, -- is_public
        anon_record.bracket_data,
        anon_record.match_results,
        anon_record.created_at,
        anon_record.updated_at,
        CASE WHEN anon_record.status = 'completed' THEN anon_record.updated_at ELSE NULL END,
        anon_record.id -- Store original ID
      ) RETURNING id INTO new_tournament_id;

      migration_count := migration_count + 1;
      RAISE NOTICE 'Migrated anonymous tournament: % → tournament: %', anon_record.id, new_tournament_id;

      -- Migrate players from bracket_data JSONB
      IF anon_record.bracket_data ? 'players' THEN
        FOR player_record IN
          SELECT * FROM jsonb_array_elements(anon_record.bracket_data->'players')
        LOOP
          INSERT INTO tournament_players (
            tournament_id,
            name,
            seed,
            wins,
            losses,
            points,
            created_at
          ) VALUES (
            new_tournament_id,
            COALESCE(player_record->>'name', 'Player'),
            (player_record->>'seed')::integer,
            COALESCE((player_record->>'wins')::integer, 0),
            COALESCE((player_record->>'losses')::integer, 0),
            COALESCE((player_record->>'points')::integer, 0),
            anon_record.created_at
          ) RETURNING id INTO new_player_id;

          -- Map old player ID to new player ID
          player_id_map := jsonb_set(
            player_id_map,
            ARRAY[player_record->>'id'],
            to_jsonb(new_player_id)
          );
        END LOOP;
      END IF;

      -- Migrate rounds from bracket_data
      IF anon_record.bracket_data ? 'rounds' THEN
        FOR round_record IN
          SELECT * FROM jsonb_array_elements(anon_record.bracket_data->'rounds')
        LOOP
          INSERT INTO tournament_rounds (
            tournament_id,
            round_number,
            name,
            round_type,
            status,
            created_at
          ) VALUES (
            new_tournament_id,
            (round_record->>'round_number')::integer,
            round_record->>'name',
            CASE
              WHEN round_record->>'type' = 'winners' THEN 'winners'
              WHEN round_record->>'type' = 'losers' THEN 'losers'
              WHEN round_record->>'type' = 'finals' THEN 'finals'
              ELSE 'winners'
            END,
            CASE
              WHEN round_record->>'status' = 'completed' THEN 'completed'
              WHEN round_record->>'status' = 'in_progress' THEN 'in_progress'
              ELSE 'pending'
            END,
            anon_record.created_at
          ) RETURNING id INTO new_round_id;

          -- Migrate matches from round
          IF round_record ? 'matches' THEN
            FOR match_record IN
              SELECT * FROM jsonb_array_elements(round_record->'matches')
            LOOP
              INSERT INTO tournament_matches (
                tournament_id,
                round_id,
                round_number,
                match_number,
                bracket_position,
                player1_id,
                player2_id,
                player1_score,
                player2_score,
                winner_id,
                status,
                created_at,
                completed_at
              ) VALUES (
                new_tournament_id,
                new_round_id,
                (round_record->>'round_number')::integer,
                (match_record->>'match_number')::integer,
                (match_record->>'position')::integer,
                CASE
                  WHEN match_record ? 'player1_id' AND player_id_map ? (match_record->>'player1_id')
                  THEN (player_id_map->(match_record->>'player1_id'))::uuid
                  ELSE NULL
                END,
                CASE
                  WHEN match_record ? 'player2_id' AND player_id_map ? (match_record->>'player2_id')
                  THEN (player_id_map->(match_record->>'player2_id'))::uuid
                  ELSE NULL
                END,
                (match_record->>'player1_score')::integer,
                (match_record->>'player2_score')::integer,
                CASE
                  WHEN match_record ? 'winner_id' AND player_id_map ? (match_record->>'winner_id')
                  THEN (player_id_map->(match_record->>'winner_id'))::uuid
                  ELSE NULL
                END,
                CASE
                  WHEN match_record->>'status' = 'completed' THEN 'completed'
                  WHEN match_record->>'status' = 'in_progress' THEN 'in_progress'
                  ELSE 'pending'
                END,
                anon_record.created_at,
                CASE
                  WHEN match_record->>'status' = 'completed' THEN anon_record.updated_at
                  ELSE NULL
                END
              );
            END LOOP;
          END IF;
        END LOOP;
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error migrating anonymous tournament %: %', anon_record.id, SQLERRM;
        -- Continue with next record
    END;
  END LOOP;

  RAISE NOTICE 'Completed migration from anonymous_tournaments: % records migrated', migration_count;
END $$;

COMMIT;

-- ============================================================================
-- PHASE 3: VALIDATION & VERIFICATION
-- ============================================================================

BEGIN;

-- Count records in each table
SELECT
  'Source Data' as category,
  'competitions' as table_name,
  COUNT(*) as record_count
FROM competitions
UNION ALL
SELECT
  'Source Data',
  'anonymous_tournaments',
  COUNT(*)
FROM anonymous_tournaments
UNION ALL
SELECT
  'Migrated Data',
  'tournaments',
  COUNT(*)
FROM tournaments
UNION ALL
SELECT
  'Migrated Data',
  'tournament_players',
  COUNT(*)
FROM tournament_players
UNION ALL
SELECT
  'Migrated Data',
  'tournament_matches',
  COUNT(*)
FROM tournament_matches
UNION ALL
SELECT
  'Migrated Data',
  'tournament_rounds',
  COUNT(*)
FROM tournament_rounds
UNION ALL
SELECT
  'Migrated Data',
  'tournament_files',
  COUNT(*)
FROM tournament_files;

-- Verify tournaments migration
SELECT
  'Tournaments from competitions' as source,
  COUNT(*) as count
FROM tournaments
WHERE legacy_competition_id IS NOT NULL
UNION ALL
SELECT
  'Tournaments from anonymous_tournaments',
  COUNT(*)
FROM tournaments
WHERE legacy_anonymous_id IS NOT NULL;

-- Check for missing organizers
SELECT
  'Tournaments without organizer' as check_name,
  COUNT(*) as count
FROM tournaments
WHERE organizer_id IS NULL;

-- Check player counts
SELECT
  t.name,
  t.current_participants as calculated_count,
  COUNT(tp.id) as actual_player_count
FROM tournaments t
LEFT JOIN tournament_players tp ON t.id = tp.tournament_id AND tp.status = 'confirmed'
GROUP BY t.id, t.name, t.current_participants
HAVING t.current_participants != COUNT(tp.id)
ORDER BY t.name;

-- Verify data integrity
SELECT
  'Integrity Check' as check_type,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS: All tournament_players reference valid tournaments'
    ELSE '❌ FAIL: ' || COUNT(*) || ' orphaned tournament_players found'
  END as result
FROM tournament_players tp
LEFT JOIN tournaments t ON tp.tournament_id = t.id
WHERE t.id IS NULL
UNION ALL
SELECT
  'Integrity Check',
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS: All tournament_matches reference valid tournaments'
    ELSE '❌ FAIL: ' || COUNT(*) || ' orphaned tournament_matches found'
  END
FROM tournament_matches tm
LEFT JOIN tournaments t ON tm.tournament_id = t.id
WHERE t.id IS NULL
UNION ALL
SELECT
  'Integrity Check',
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS: All tournament_files reference valid tournaments'
    ELSE '❌ FAIL: ' || COUNT(*) || ' orphaned tournament_files found'
  END
FROM tournament_files tf
LEFT JOIN tournaments t ON tf.tournament_id = t.id
WHERE t.id IS NULL;

COMMIT;

-- ============================================================================
-- PHASE 4: POST-MIGRATION CLEANUP (OPTIONAL - UNCOMMENT WHEN READY)
-- ============================================================================

-- IMPORTANT: Only run this after verifying migration success and testing the application!
-- This will rename the old tables as backup

/*
BEGIN;

-- Rename old tables for backup
ALTER TABLE IF EXISTS competitions RENAME TO competitions_backup_20250120;
ALTER TABLE IF EXISTS anonymous_tournaments RENAME TO anonymous_tournaments_backup_20250120;
ALTER TABLE IF EXISTS participants RENAME TO participants_backup_20250120;
ALTER TABLE IF EXISTS competition_files RENAME TO competition_files_backup_20250120;

-- Drop old indexes to free up space
DROP INDEX IF EXISTS idx_competitions_organizer_id;
DROP INDEX IF EXISTS idx_anonymous_tournaments_unique_url_code;
DROP INDEX IF EXISTS idx_participants_competition_id;

RAISE NOTICE 'Old tables renamed with _backup_20250120 suffix';
RAISE NOTICE 'To permanently delete: DROP TABLE competitions_backup_20250120 CASCADE;';

COMMIT;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT
  '✅ DATA MIGRATION COMPLETE!' as status,
  NOW() as completed_at;

-- ============================================================================
-- NEXT STEPS:
-- ============================================================================
-- 1. Review validation queries output
-- 2. Test CRUD operations in application
-- 3. Verify RLS policies work correctly
-- 4. Test bracket generation and match management
-- 5. Check file uploads and retrieval
-- 6. Once confident, uncomment PHASE 4 to backup old tables
-- 7. Update application services to use new schema
-- ============================================================================
