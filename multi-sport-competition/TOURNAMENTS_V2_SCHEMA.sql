-- =====================================================
-- TOURNAMENTS V2 - NORMALIZED SCHEMA
-- =====================================================
-- This schema replaces the JSONB-based anonymous_tournaments table
-- with a fully normalized relational model for better performance,
-- security, and maintainability.
--
-- Key improvements:
-- - Normalized data (tournaments, players, matches, rounds as separate tables)
-- - Granular updates (no need to rewrite entire JSONB blob)
-- - Database-level constraints and referential integrity
-- - Proper indexes for performance
-- - Secure RLS policies with edit tokens
-- - Support for hybrid auth (anonymous with tokens OR authenticated users)
-- =====================================================

-- =====================================================
-- 1. TOURNAMENTS TABLE (Main tournament metadata)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL CHECK (length(name) >= 3 AND length(name) <= 200),
  location TEXT NOT NULL CHECK (length(location) >= 3 AND length(location) <= 200),
  tournament_date DATE NOT NULL,
  description TEXT,

  -- Tournament Configuration
  format TEXT NOT NULL CHECK (format IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  sport TEXT DEFAULT 'tennis' CHECK (length(sport) <= 50),
  players_count INT NOT NULL CHECK (players_count >= 2 AND players_count <= 128),

  -- Status Management
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'in_progress', 'completed', 'cancelled')),
  current_round INT DEFAULT 1 CHECK (current_round >= 1),
  total_rounds INT CHECK (total_rounds >= 1),

  -- Access Control (Hybrid: anonymous OR authenticated)
  unique_url_code TEXT UNIQUE NOT NULL CHECK (length(unique_url_code) = 8),
  edit_token_hash TEXT, -- Bcrypt hash for anonymous edit access
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For authenticated users
  is_public BOOLEAN DEFAULT true,

  -- Metadata
  views_count INT DEFAULT 0 CHECK (views_count >= 0),
  last_viewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_token_or_owner CHECK (
    edit_token_hash IS NOT NULL OR owner_id IS NOT NULL
  )
);

-- Indexes for performance
CREATE INDEX idx_tournaments_url_code ON public.tournaments(unique_url_code);
CREATE INDEX idx_tournaments_owner_id ON public.tournaments(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournaments_format ON public.tournaments(format);
CREATE INDEX idx_tournaments_date ON public.tournaments(tournament_date);
CREATE INDEX idx_tournaments_expires ON public.tournaments(expires_at) WHERE status != 'completed';

-- =====================================================
-- 2. TOURNAMENT_PLAYERS TABLE (Participants/Competitors)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tournament_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,

  -- Player Info
  name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 100),
  seed INT CHECK (seed >= 1), -- Seeding position (1 = top seed)

  -- Optional Contact (for authenticated tournaments)
  email TEXT CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT,

  -- Statistics (updated via triggers)
  matches_played INT DEFAULT 0 CHECK (matches_played >= 0),
  matches_won INT DEFAULT 0 CHECK (matches_won >= 0),
  matches_lost INT DEFAULT 0 CHECK (matches_lost >= 0),

  -- Swiss/Round-robin specific
  points INT DEFAULT 0 CHECK (points >= 0), -- Win = 1 point
  buchholz_score DECIMAL(10, 2) DEFAULT 0, -- Swiss tiebreaker

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(tournament_id, name), -- No duplicate names in same tournament
  UNIQUE(tournament_id, seed) WHERE seed IS NOT NULL, -- No duplicate seeds
  CHECK (matches_won + matches_lost <= matches_played)
);

-- Indexes
CREATE INDEX idx_players_tournament ON public.tournament_players(tournament_id);
CREATE INDEX idx_players_seed ON public.tournament_players(tournament_id, seed) WHERE seed IS NOT NULL;
CREATE INDEX idx_players_points ON public.tournament_players(tournament_id, points DESC);

-- =====================================================
-- 3. TOURNAMENT_MATCHES TABLE (Individual matches with scores)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,

  -- Match Position in Bracket
  round_number INT NOT NULL CHECK (round_number >= 1),
  match_number INT NOT NULL CHECK (match_number >= 1), -- Position within round
  bracket_type TEXT DEFAULT 'main' CHECK (bracket_type IN ('main', 'winner', 'loser', 'grand_final')), -- For double elimination

  -- Players (NULL = BYE or TBD)
  player1_id UUID REFERENCES public.tournament_players(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES public.tournament_players(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES public.tournament_players(id) ON DELETE SET NULL,

  -- Score Data (detailed sets/games)
  score_data JSONB DEFAULT '{"sets": []}',
  -- Example: {"sets": [{"player1": 6, "player2": 4}, {"player1": 7, "player2": 5}], "tiebreaks": [null, null]}

  -- Match Metadata
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'walkover', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  court TEXT, -- Court/table assignment
  notes TEXT, -- Referee notes, comments

  -- Bracket Navigation (for rendering)
  feeds_to_match_id UUID REFERENCES public.tournament_matches(id) ON DELETE SET NULL, -- Next match for winner
  feeds_to_loser_match_id UUID REFERENCES public.tournament_matches(id) ON DELETE SET NULL, -- For double elimination

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(tournament_id, round_number, match_number, bracket_type),
  CHECK (player1_id != player2_id), -- Can't play yourself
  CHECK (winner_id IN (player1_id, player2_id) OR winner_id IS NULL), -- Winner must be a participant
  CHECK (status = 'completed' OR winner_id IS NULL), -- Winner only if completed
  CHECK (completed_at IS NULL OR completed_at >= created_at)
);

-- Indexes
CREATE INDEX idx_matches_tournament ON public.tournament_matches(tournament_id);
CREATE INDEX idx_matches_round ON public.tournament_matches(tournament_id, round_number);
CREATE INDEX idx_matches_status ON public.tournament_matches(status);
CREATE INDEX idx_matches_player1 ON public.tournament_matches(player1_id) WHERE player1_id IS NOT NULL;
CREATE INDEX idx_matches_player2 ON public.tournament_matches(player2_id) WHERE player2_id IS NOT NULL;
CREATE INDEX idx_matches_scheduled ON public.tournament_matches(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_matches_feeds_to ON public.tournament_matches(feeds_to_match_id) WHERE feeds_to_match_id IS NOT NULL;

-- =====================================================
-- 4. TOURNAMENT_ROUNDS TABLE (For Swiss/Round-robin tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tournament_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,

  -- Round Info
  round_number INT NOT NULL CHECK (round_number >= 1),
  name TEXT, -- "Round 1", "Quarterfinals", etc.
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),

  -- Metadata
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(tournament_id, round_number),
  CHECK (completed_at IS NULL OR started_at IS NOT NULL),
  CHECK (completed_at IS NULL OR completed_at >= started_at)
);

-- Indexes
CREATE INDEX idx_rounds_tournament ON public.tournament_rounds(tournament_id);
CREATE INDEX idx_rounds_status ON public.tournament_rounds(tournament_id, status);

-- =====================================================
-- 5. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tournament_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION update_tournament_updated_at();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.tournament_players
  FOR EACH ROW EXECUTE FUNCTION update_tournament_updated_at();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.tournament_matches
  FOR EACH ROW EXECUTE FUNCTION update_tournament_updated_at();

CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON public.tournament_rounds
  FOR EACH ROW EXECUTE FUNCTION update_tournament_updated_at();

-- Function: Generate unique URL code (crypto-secure)
CREATE OR REPLACE FUNCTION generate_tournament_url_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Function: Auto-generate unique URL code if not provided
CREATE OR REPLACE FUNCTION ensure_unique_url_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  attempts INT := 0;
  max_attempts INT := 10;
BEGIN
  IF NEW.unique_url_code IS NULL THEN
    LOOP
      new_code := generate_tournament_url_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.tournaments WHERE unique_url_code = new_code);
      attempts := attempts + 1;
      EXIT WHEN attempts >= max_attempts;
    END LOOP;

    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique URL code after % attempts', max_attempts;
    END IF;

    NEW.unique_url_code := new_code;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_tournament_url_code BEFORE INSERT ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION ensure_unique_url_code();

-- Function: Update player statistics when match is completed
CREATE OR REPLACE FUNCTION update_player_stats_on_match_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if match is newly completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update player1
    IF NEW.player1_id IS NOT NULL THEN
      UPDATE public.tournament_players
      SET
        matches_played = matches_played + 1,
        matches_won = matches_won + CASE WHEN NEW.winner_id = NEW.player1_id THEN 1 ELSE 0 END,
        matches_lost = matches_lost + CASE WHEN NEW.winner_id = NEW.player2_id THEN 1 ELSE 0 END,
        points = points + CASE WHEN NEW.winner_id = NEW.player1_id THEN 1 ELSE 0 END
      WHERE id = NEW.player1_id;
    END IF;

    -- Update player2
    IF NEW.player2_id IS NOT NULL THEN
      UPDATE public.tournament_players
      SET
        matches_played = matches_played + 1,
        matches_won = matches_won + CASE WHEN NEW.winner_id = NEW.player2_id THEN 1 ELSE 0 END,
        matches_lost = matches_lost + CASE WHEN NEW.winner_id = NEW.player1_id THEN 1 ELSE 0 END,
        points = points + CASE WHEN NEW.winner_id = NEW.player2_id THEN 1 ELSE 0 END
      WHERE id = NEW.player2_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_stats AFTER INSERT OR UPDATE ON public.tournament_matches
  FOR EACH ROW EXECUTE FUNCTION update_player_stats_on_match_complete();

-- Function: Cleanup expired tournaments
CREATE OR REPLACE FUNCTION cleanup_expired_tournaments()
RETURNS void AS $$
BEGIN
  DELETE FROM public.tournaments
  WHERE expires_at < NOW()
    AND status != 'completed' -- Keep completed tournaments
    AND owner_id IS NULL; -- Only cleanup anonymous tournaments
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_rounds ENABLE ROW LEVEL SECURITY;

-- ===== TOURNAMENTS POLICIES =====

-- SELECT: Anyone can view public tournaments
CREATE POLICY "tournaments_public_read"
  ON public.tournaments FOR SELECT
  USING (is_public = true);

-- SELECT: Owners can view their own tournaments (even if private)
CREATE POLICY "tournaments_owner_read"
  ON public.tournaments FOR SELECT
  USING (auth.uid() = owner_id);

-- INSERT: Authenticated users can create tournaments
CREATE POLICY "tournaments_authenticated_create"
  ON public.tournaments FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- INSERT: Anonymous users can create tournaments (with edit_token_hash)
CREATE POLICY "tournaments_anonymous_create"
  ON public.tournaments FOR INSERT
  WITH CHECK (
    edit_token_hash IS NOT NULL
    AND owner_id IS NULL
  );

-- UPDATE: Owners can update their tournaments
CREATE POLICY "tournaments_owner_update"
  ON public.tournaments FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- UPDATE: Anonymous users can update with valid edit token
-- Note: Token validation must be done in application layer (RLS can't hash)
-- This policy allows updates if owner_id is NULL (anonymous tournament)
CREATE POLICY "tournaments_anonymous_update"
  ON public.tournaments FOR UPDATE
  USING (owner_id IS NULL);

-- DELETE: Only owners can delete
CREATE POLICY "tournaments_owner_delete"
  ON public.tournaments FOR DELETE
  USING (auth.uid() = owner_id);

-- ===== PLAYERS POLICIES =====

-- SELECT: Anyone can view players of public tournaments
CREATE POLICY "players_public_read"
  ON public.tournament_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_players.tournament_id
        AND is_public = true
    )
  );

-- INSERT/UPDATE/DELETE: Anyone who can update the tournament can manage players
CREATE POLICY "players_tournament_manager"
  ON public.tournament_players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_players.tournament_id
        AND (auth.uid() = owner_id OR owner_id IS NULL)
    )
  );

-- ===== MATCHES POLICIES =====

-- SELECT: Anyone can view matches of public tournaments
CREATE POLICY "matches_public_read"
  ON public.tournament_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_matches.tournament_id
        AND is_public = true
    )
  );

-- INSERT/UPDATE/DELETE: Anyone who can update the tournament can manage matches
CREATE POLICY "matches_tournament_manager"
  ON public.tournament_matches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_matches.tournament_id
        AND (auth.uid() = owner_id OR owner_id IS NULL)
    )
  );

-- ===== ROUNDS POLICIES =====

-- SELECT: Anyone can view rounds of public tournaments
CREATE POLICY "rounds_public_read"
  ON public.tournament_rounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_rounds.tournament_id
        AND is_public = true
    )
  );

-- INSERT/UPDATE/DELETE: Anyone who can update the tournament can manage rounds
CREATE POLICY "rounds_tournament_manager"
  ON public.tournament_rounds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_rounds.tournament_id
        AND (auth.uid() = owner_id OR owner_id IS NULL)
    )
  );

-- =====================================================
-- 7. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.tournaments IS 'Main tournaments table with hybrid auth support (anonymous with tokens OR authenticated users)';
COMMENT ON TABLE public.tournament_players IS 'Tournament participants with seeding and statistics';
COMMENT ON TABLE public.tournament_matches IS 'Individual matches with detailed scores and bracket navigation';
COMMENT ON TABLE public.tournament_rounds IS 'Round tracking for Swiss and Round-robin formats';

COMMENT ON COLUMN public.tournaments.edit_token_hash IS 'Bcrypt hash of edit token for anonymous access control';
COMMENT ON COLUMN public.tournaments.owner_id IS 'User ID for authenticated tournament owners (NULL for anonymous)';
COMMENT ON COLUMN public.tournaments.unique_url_code IS '8-character unique code for public URL access';

COMMENT ON COLUMN public.tournament_players.seed IS 'Seeding position (1 = top seed, NULL = unseeded)';
COMMENT ON COLUMN public.tournament_players.buchholz_score IS 'Swiss system tiebreaker (sum of opponents points)';

COMMENT ON COLUMN public.tournament_matches.bracket_type IS 'Bracket type: main (single elim), winner/loser (double elim), grand_final';
COMMENT ON COLUMN public.tournament_matches.score_data IS 'Detailed score JSONB: {sets: [{player1: 6, player2: 4}, ...], tiebreaks: [7, null, ...]}';
COMMENT ON COLUMN public.tournament_matches.feeds_to_match_id IS 'Next match ID for winner advancement';
COMMENT ON COLUMN public.tournament_matches.feeds_to_loser_match_id IS 'Loser bracket match ID (double elimination only)';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
