-- ============================================================================
-- UNIFIED TOURNAMENT SYSTEM - COMPLETE DATABASE MIGRATION
-- ============================================================================
-- Version: 1.0.0
-- Date: 2025-01-20
-- Purpose: Merge 'competitions' and 'anonymous_tournaments' into unified 'tournaments' table
--
-- IMPORTANT:
-- 1. Create full backup before running: pg_dump -h <host> -U postgres -d <db> > backup.sql
-- 2. Test in staging environment first
-- 3. Run during low-traffic period
-- 4. Estimated time: 5-15 minutes depending on data volume
-- ============================================================================

-- ============================================================================
-- PHASE 1: CREATE UNIFIED TOURNAMENTS TABLE
-- ============================================================================

BEGIN;

-- Create main tournaments table (unified schema)
CREATE TABLE IF NOT EXISTS tournaments (
  -- Primary identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_url_code TEXT UNIQUE NOT NULL,

  -- Organizer (can be null for anonymous tournaments during migration)
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Basic tournament information
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT NOT NULL,

  -- Tournament format & configuration
  format TEXT NOT NULL CHECK (format IN ('single-elimination', 'double-elimination', 'round-robin', 'swiss')),
  max_participants INTEGER NOT NULL DEFAULT 16,
  current_participants INTEGER NOT NULL DEFAULT 0,

  -- Location details
  location TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',

  -- Scheduling
  date DATE,
  start_time TIME,
  end_time TIME,

  -- Categories & visibility
  age_category TEXT CHECK (age_category IN ('minors', 'adults', 'both')),
  is_official BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,

  -- Status management
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),

  -- Bracket data (JSONB for flexibility)
  bracket_data JSONB DEFAULT '{}'::jsonb,
  match_results JSONB DEFAULT '[]'::jsonb,

  -- Media
  cover_image_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Legacy fields for migration compatibility
  legacy_competition_id UUID, -- Original ID from 'competitions' table
  legacy_anonymous_id UUID    -- Original ID from 'anonymous_tournaments' table
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer_id ON tournaments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_unique_url_code ON tournaments(unique_url_code);
CREATE INDEX IF NOT EXISTS idx_tournaments_sport ON tournaments(sport);
CREATE INDEX IF NOT EXISTS idx_tournaments_city ON tournaments(city);
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_format ON tournaments(format);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_at ON tournaments(created_at DESC);

-- GIN index for JSONB columns (efficient querying)
CREATE INDEX IF NOT EXISTS idx_tournaments_bracket_data ON tournaments USING GIN (bracket_data);
CREATE INDEX IF NOT EXISTS idx_tournaments_match_results ON tournaments USING GIN (match_results);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer_status ON tournaments(organizer_id, status);
CREATE INDEX IF NOT EXISTS idx_tournaments_sport_date ON tournaments(sport, date);

COMMIT;

-- ============================================================================
-- PHASE 2: CREATE RELATIONAL TABLES
-- ============================================================================

BEGIN;

-- Tournament Players Table (replaces JSONB players array)
CREATE TABLE IF NOT EXISTS tournament_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,

  -- Player information
  name TEXT NOT NULL,
  email TEXT,
  seed INTEGER, -- Seeding for brackets

  -- Profile link (optional)
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Team information (for team tournaments)
  team_name TEXT,
  team_id UUID,

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'rejected', 'withdrawn')),

  -- Stats & performance
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,

  -- Swiss system specific
  buchholz_score DECIMAL(10,2) DEFAULT 0.00,
  opponents JSONB DEFAULT '[]'::jsonb, -- Array of opponent IDs for swiss pairing

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(tournament_id, name),
  CONSTRAINT valid_seed CHECK (seed IS NULL OR seed > 0)
);

CREATE INDEX IF NOT EXISTS idx_tournament_players_tournament_id ON tournament_players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_players_profile_id ON tournament_players(profile_id);
CREATE INDEX IF NOT EXISTS idx_tournament_players_status ON tournament_players(status);
CREATE INDEX IF NOT EXISTS idx_tournament_players_seed ON tournament_players(seed);

-- Tournament Matches Table (normalized match tracking)
CREATE TABLE IF NOT EXISTS tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,

  -- Match identification
  match_number INTEGER NOT NULL,
  round_id UUID REFERENCES tournament_rounds(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,

  -- Bracket position
  bracket_position INTEGER, -- Position in bracket tree
  bracket_type TEXT CHECK (bracket_type IN ('winners', 'losers', 'finals', 'third-place')),

  -- Participants
  player1_id UUID REFERENCES tournament_players(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES tournament_players(id) ON DELETE SET NULL,

  -- Results
  player1_score INTEGER,
  player2_score INTEGER,
  winner_id UUID REFERENCES tournament_players(id) ON DELETE SET NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),

  -- Scheduling
  scheduled_time TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Match details (sets, games, etc.)
  details JSONB DEFAULT '{}'::jsonb,

  -- Next match routing (for elimination brackets)
  next_match_id UUID REFERENCES tournament_matches(id) ON DELETE SET NULL,
  loser_next_match_id UUID REFERENCES tournament_matches(id) ON DELETE SET NULL, -- For double elimination

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(tournament_id, match_number),
  CONSTRAINT valid_score CHECK (
    (player1_score IS NULL AND player2_score IS NULL) OR
    (player1_score >= 0 AND player2_score >= 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_round_id ON tournament_matches(round_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_status ON tournament_matches(status);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_player1 ON tournament_matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_player2 ON tournament_matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_winner ON tournament_matches(winner_id);

-- Tournament Rounds Table
CREATE TABLE IF NOT EXISTS tournament_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,

  -- Round information
  round_number INTEGER NOT NULL,
  name TEXT NOT NULL, -- e.g., "Round 1", "Quarterfinals", "Semifinals", "Finals"

  -- Round type
  round_type TEXT CHECK (round_type IN ('winners', 'losers', 'finals', 'third-place', 'round-robin', 'swiss')),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),

  -- Scheduling
  scheduled_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tournament_id, round_number, round_type)
);

CREATE INDEX IF NOT EXISTS idx_tournament_rounds_tournament_id ON tournament_rounds(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_rounds_status ON tournament_rounds(status);

-- Tournament Files Table (documents, images, etc.)
CREATE TABLE IF NOT EXISTS tournament_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,

  -- File information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,

  -- Storage
  storage_bucket TEXT NOT NULL DEFAULT 'tournament-files',
  storage_path TEXT NOT NULL,

  -- Metadata
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- File description
  description TEXT,
  category TEXT CHECK (category IN ('rules', 'schedule', 'results', 'photo', 'document', 'other'))
);

CREATE INDEX IF NOT EXISTS idx_tournament_files_tournament_id ON tournament_files(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_files_uploaded_by ON tournament_files(uploaded_by);

COMMIT;

-- ============================================================================
-- PHASE 3: CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

BEGIN;

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tournaments
DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to tournament_players
DROP TRIGGER IF EXISTS update_tournament_players_updated_at ON tournament_players;
CREATE TRIGGER update_tournament_players_updated_at
  BEFORE UPDATE ON tournament_players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to tournament_matches
DROP TRIGGER IF EXISTS update_tournament_matches_updated_at ON tournament_matches;
CREATE TRIGGER update_tournament_matches_updated_at
  BEFORE UPDATE ON tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to tournament_rounds
DROP TRIGGER IF EXISTS update_tournament_rounds_updated_at ON tournament_rounds;
CREATE TRIGGER update_tournament_rounds_updated_at
  BEFORE UPDATE ON tournament_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update participant count
CREATE OR REPLACE FUNCTION update_tournament_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'confirmed' THEN
      UPDATE tournaments
      SET current_participants = current_participants + 1
      WHERE id = NEW.tournament_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      UPDATE tournaments
      SET current_participants = current_participants + 1
      WHERE id = NEW.tournament_id;
    ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
      UPDATE tournaments
      SET current_participants = current_participants - 1
      WHERE id = NEW.tournament_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'confirmed' THEN
      UPDATE tournaments
      SET current_participants = current_participants - 1
      WHERE id = OLD.tournament_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tournament_participant_count_trigger ON tournament_players;
CREATE TRIGGER update_tournament_participant_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tournament_players
  FOR EACH ROW
  EXECUTE FUNCTION update_tournament_participant_count();

COMMIT;

-- ============================================================================
-- PHASE 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

BEGIN;

-- Enable RLS on all tables
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_files ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TOURNAMENTS TABLE POLICIES
-- ============================================================================

-- Public read access for public tournaments
DROP POLICY IF EXISTS "Public tournaments are viewable by everyone" ON tournaments;
CREATE POLICY "Public tournaments are viewable by everyone"
  ON tournaments FOR SELECT
  USING (is_public = true);

-- Authenticated users can view all tournaments
DROP POLICY IF EXISTS "Authenticated users can view all tournaments" ON tournaments;
CREATE POLICY "Authenticated users can view all tournaments"
  ON tournaments FOR SELECT
  TO authenticated
  USING (true);

-- Organizers can insert their own tournaments
DROP POLICY IF EXISTS "Users can create tournaments" ON tournaments;
CREATE POLICY "Users can create tournaments"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their own tournaments
DROP POLICY IF EXISTS "Organizers can update their own tournaments" ON tournaments;
CREATE POLICY "Organizers can update their own tournaments"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Organizers can delete their own tournaments
DROP POLICY IF EXISTS "Organizers can delete their own tournaments" ON tournaments;
CREATE POLICY "Organizers can delete their own tournaments"
  ON tournaments FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- ============================================================================
-- TOURNAMENT_PLAYERS TABLE POLICIES
-- ============================================================================

-- Anyone can view players in public tournaments
DROP POLICY IF EXISTS "Public tournament players are viewable" ON tournament_players;
CREATE POLICY "Public tournament players are viewable"
  ON tournament_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_players.tournament_id
      AND tournaments.is_public = true
    )
  );

-- Authenticated users can view all tournament players
DROP POLICY IF EXISTS "Authenticated users can view all players" ON tournament_players;
CREATE POLICY "Authenticated users can view all players"
  ON tournament_players FOR SELECT
  TO authenticated
  USING (true);

-- Organizers can manage players in their tournaments
DROP POLICY IF EXISTS "Organizers can manage players" ON tournament_players;
CREATE POLICY "Organizers can manage players"
  ON tournament_players FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_players.tournament_id
      AND tournaments.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_players.tournament_id
      AND tournaments.organizer_id = auth.uid()
    )
  );

-- ============================================================================
-- TOURNAMENT_MATCHES TABLE POLICIES
-- ============================================================================

-- Anyone can view matches in public tournaments
DROP POLICY IF EXISTS "Public tournament matches are viewable" ON tournament_matches;
CREATE POLICY "Public tournament matches are viewable"
  ON tournament_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_matches.tournament_id
      AND tournaments.is_public = true
    )
  );

-- Authenticated users can view all matches
DROP POLICY IF EXISTS "Authenticated users can view all matches" ON tournament_matches;
CREATE POLICY "Authenticated users can view all matches"
  ON tournament_matches FOR SELECT
  TO authenticated
  USING (true);

-- Organizers can manage matches in their tournaments
DROP POLICY IF EXISTS "Organizers can manage matches" ON tournament_matches;
CREATE POLICY "Organizers can manage matches"
  ON tournament_matches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_matches.tournament_id
      AND tournaments.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_matches.tournament_id
      AND tournaments.organizer_id = auth.uid()
    )
  );

-- ============================================================================
-- TOURNAMENT_ROUNDS TABLE POLICIES
-- ============================================================================

-- Anyone can view rounds in public tournaments
DROP POLICY IF EXISTS "Public tournament rounds are viewable" ON tournament_rounds;
CREATE POLICY "Public tournament rounds are viewable"
  ON tournament_rounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_rounds.tournament_id
      AND tournaments.is_public = true
    )
  );

-- Authenticated users can view all rounds
DROP POLICY IF EXISTS "Authenticated users can view all rounds" ON tournament_rounds;
CREATE POLICY "Authenticated users can view all rounds"
  ON tournament_rounds FOR SELECT
  TO authenticated
  USING (true);

-- Organizers can manage rounds in their tournaments
DROP POLICY IF EXISTS "Organizers can manage rounds" ON tournament_rounds;
CREATE POLICY "Organizers can manage rounds"
  ON tournament_rounds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_rounds.tournament_id
      AND tournaments.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_rounds.tournament_id
      AND tournaments.organizer_id = auth.uid()
    )
  );

-- ============================================================================
-- TOURNAMENT_FILES TABLE POLICIES
-- ============================================================================

-- Anyone can view files in public tournaments
DROP POLICY IF EXISTS "Public tournament files are viewable" ON tournament_files;
CREATE POLICY "Public tournament files are viewable"
  ON tournament_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_files.tournament_id
      AND tournaments.is_public = true
    )
  );

-- Authenticated users can view all files
DROP POLICY IF EXISTS "Authenticated users can view all files" ON tournament_files;
CREATE POLICY "Authenticated users can view all files"
  ON tournament_files FOR SELECT
  TO authenticated
  USING (true);

-- Organizers can manage files in their tournaments
DROP POLICY IF EXISTS "Organizers can manage files" ON tournament_files;
CREATE POLICY "Organizers can manage files"
  ON tournament_files FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_files.tournament_id
      AND tournaments.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_files.tournament_id
      AND tournaments.organizer_id = auth.uid()
    )
  );

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE - VERIFICATION QUERIES
-- ============================================================================

-- Verify table creation
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE tablename IN ('tournaments', 'tournament_players', 'tournament_matches', 'tournament_rounds', 'tournament_files')
ORDER BY tablename;

-- Verify indexes
SELECT
  indexname,
  tablename
FROM pg_indexes
WHERE tablename LIKE 'tournament%'
ORDER BY tablename, indexname;

-- Verify triggers
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table LIKE 'tournament%'
ORDER BY event_object_table, trigger_name;

-- Verify RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename LIKE 'tournament%'
ORDER BY tablename;

-- Summary
SELECT
  'Tables Created' as status,
  COUNT(*) as count
FROM pg_tables
WHERE tablename IN ('tournaments', 'tournament_players', 'tournament_matches', 'tournament_rounds', 'tournament_files')
UNION ALL
SELECT
  'Indexes Created',
  COUNT(*)
FROM pg_indexes
WHERE tablename LIKE 'tournament%'
UNION ALL
SELECT
  'Triggers Created',
  COUNT(*)
FROM information_schema.triggers
WHERE event_object_table LIKE 'tournament%'
UNION ALL
SELECT
  'RLS Policies Created',
  COUNT(*)
FROM pg_policies
WHERE tablename LIKE 'tournament%';

-- ============================================================================
-- NEXT STEPS:
-- ============================================================================
-- 1. Run data migration script: DATABASE_MIGRATION_DATA.sql
-- 2. Verify data integrity with validation queries
-- 3. Update application code to use new schema
-- 4. Test all CRUD operations
-- 5. Deploy to production
-- ============================================================================
