-- ============================================
-- TABLE: anonymous_tournaments
-- Tournois créés sans authentification
-- ============================================

CREATE TABLE public.anonymous_tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identifiant unique pour l'URL
  unique_url_code TEXT UNIQUE NOT NULL,

  -- Informations du tournoi
  name TEXT NOT NULL,
  location TEXT,
  tournament_date DATE,

  -- Configuration
  format TEXT NOT NULL CHECK (format IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  players_count INTEGER NOT NULL CHECK (players_count >= 2 AND players_count <= 128),

  -- Données des joueurs et du bracket
  players_names JSONB NOT NULL DEFAULT '[]'::jsonb,
  bracket_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  match_results JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- État du tournoi
  status TEXT DEFAULT 'setup' CHECK (status IN ('setup', 'in_progress', 'completed')),

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

  -- Tracking (optionnel, pour analytics)
  views_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  -- Link to registered user (optional)
  organizer_id UUID REFERENCES auth.users(id)
);

-- Index pour recherche rapide par URL code
CREATE INDEX idx_anonymous_tournaments_url_code ON public.anonymous_tournaments(unique_url_code);
CREATE INDEX idx_anonymous_tournaments_created ON public.anonymous_tournaments(created_at);
CREATE INDEX idx_anonymous_tournaments_expires ON public.anonymous_tournaments(expires_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.anonymous_tournaments ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les tournois
CREATE POLICY "Anyone can view anonymous tournaments"
  ON public.anonymous_tournaments FOR SELECT
  USING (true);

-- Politique: Tout le monde peut créer un tournoi
CREATE POLICY "Anyone can create anonymous tournaments"
  ON public.anonymous_tournaments FOR INSERT
  WITH CHECK (true);

-- Politique: Tout le monde peut mettre à jour un tournoi
CREATE POLICY "Anyone can update anonymous tournaments"
  ON public.anonymous_tournaments FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Politique: Tout le monde peut supprimer un tournoi (pour cleanup manuel)
CREATE POLICY "Anyone can delete anonymous tournaments"
  ON public.anonymous_tournaments FOR DELETE
  USING (true);

-- ============================================
-- FONCTIONS & TRIGGERS
-- ============================================

-- Fonction: Mettre à jour updated_at automatiquement
CREATE TRIGGER update_anonymous_tournaments_updated_at
  BEFORE UPDATE ON public.anonymous_tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction: Générer un code URL unique aléatoire
CREATE OR REPLACE FUNCTION generate_unique_tournament_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    -- Générer un code de 8 caractères
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM public.anonymous_tournaments WHERE unique_url_code = result) INTO code_exists;

    -- Si le code n'existe pas, le retourner
    IF NOT code_exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Fonction: Nettoyer les tournois expirés (à exécuter via cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_tournaments()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.anonymous_tournaments
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- EXEMPLE D'UTILISATION
-- ============================================

-- Créer un tournoi de test:
/*
INSERT INTO public.anonymous_tournaments (
  unique_url_code,
  name,
  location,
  tournament_date,
  format,
  players_count,
  players_names,
  bracket_data
) VALUES (
  generate_unique_tournament_code(),
  'Tournoi de Tennis du Printemps',
  'Club de Tennis Municipal',
  '2025-06-15',
  'single_elimination',
  8,
  '["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry"]'::jsonb,
  '{}'::jsonb
);
*/

-- Nettoyer manuellement les tournois expirés:
-- SELECT cleanup_expired_tournaments();
