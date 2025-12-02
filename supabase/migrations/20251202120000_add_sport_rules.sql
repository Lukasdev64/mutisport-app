-- Migration: Add Sport Rules Library
-- Provides a structured rules database with full-text search for tennis (extensible to other sports)

-- Create sport_rules table
CREATE TABLE IF NOT EXISTS public.sport_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sport identification (extensible for basketball, etc.)
  sport text NOT NULL DEFAULT 'tennis',

  -- Categorization
  category_id text NOT NULL,           -- e.g., 'service', 'scoring', 'fautes'
  category_name text NOT NULL,         -- e.g., 'Le Service', 'Le Comptage des Points'
  category_order int NOT NULL DEFAULT 0, -- Display order within sport

  -- Rule content
  title text NOT NULL,                 -- Rule title (e.g., 'Position du Serveur')
  slug text NOT NULL,                  -- URL-friendly ID
  content text NOT NULL,               -- Full rule content (Markdown supported)
  summary text,                        -- Short description for previews

  -- Search & filtering
  tags text[] DEFAULT '{}',            -- e.g., ['service', 'faute_de_pied', 'debutant']
  keywords text,                       -- Full-text search field

  -- Metadata
  source text,                         -- e.g., 'ITF Rules of Tennis 2025'
  source_url text,                     -- Link to official source
  difficulty text DEFAULT 'beginner',  -- 'beginner' | 'intermediate' | 'advanced'

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_sport_rules_sport ON public.sport_rules(sport);
CREATE INDEX IF NOT EXISTS idx_sport_rules_category ON public.sport_rules(sport, category_id);
CREATE INDEX IF NOT EXISTS idx_sport_rules_tags ON public.sport_rules USING GIN(tags);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sport_rules_slug ON public.sport_rules(sport, slug);

-- Full-text search index (French language)
CREATE INDEX IF NOT EXISTS idx_sport_rules_search ON public.sport_rules
  USING GIN(to_tsvector('french', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(keywords, '')));

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_sport_rules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sport_rules_updated_at ON public.sport_rules;
CREATE TRIGGER sport_rules_updated_at
  BEFORE UPDATE ON public.sport_rules
  FOR EACH ROW EXECUTE FUNCTION update_sport_rules_timestamp();

-- RLS: Public read access (free feature for all users)
ALTER TABLE public.sport_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sport rules are publicly readable" ON public.sport_rules;
CREATE POLICY "Sport rules are publicly readable"
  ON public.sport_rules FOR SELECT USING (true);

-- Search function for rules with full-text ranking
CREATE OR REPLACE FUNCTION search_sport_rules(
  p_sport text,
  p_query text,
  p_category_id text DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  sport text,
  category_id text,
  category_name text,
  title text,
  slug text,
  summary text,
  tags text[],
  rank real
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.sport,
    r.category_id,
    r.category_name,
    r.title,
    r.slug,
    r.summary,
    r.tags,
    ts_rank(
      to_tsvector('french', coalesce(r.title, '') || ' ' || coalesce(r.content, '') || ' ' || coalesce(r.keywords, '')),
      plainto_tsquery('french', p_query)
    ) as rank
  FROM public.sport_rules r
  WHERE r.sport = p_sport
    AND (p_category_id IS NULL OR r.category_id = p_category_id)
    AND (
      p_query IS NULL
      OR p_query = ''
      OR to_tsvector('french', coalesce(r.title, '') || ' ' || coalesce(r.content, '') || ' ' || coalesce(r.keywords, ''))
         @@ plainto_tsquery('french', p_query)
    )
  ORDER BY rank DESC, r.category_order, r.title
  LIMIT p_limit;
END;
$$;

-- Grant execute permission on search function
GRANT EXECUTE ON FUNCTION search_sport_rules TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE public.sport_rules IS 'Stores official sport rules content with categories and full-text search';
COMMENT ON COLUMN public.sport_rules.sport IS 'Sport identifier (tennis, basketball, etc.)';
COMMENT ON COLUMN public.sport_rules.category_id IS 'Category slug for grouping rules';
COMMENT ON COLUMN public.sport_rules.content IS 'Rule content in Markdown format';
COMMENT ON COLUMN public.sport_rules.difficulty IS 'Rule complexity: beginner, intermediate, advanced';
COMMENT ON FUNCTION search_sport_rules IS 'Full-text search for sport rules with French language support';
