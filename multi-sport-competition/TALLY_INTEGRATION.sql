-- Table pour stocker les soumissions brutes de Tally
CREATE TABLE public.tally_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id TEXT,
  submission_id TEXT,
  respondent_email TEXT,
  payload JSONB, -- Stocke toute la réponse Tally
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.tally_submissions ENABLE ROW LEVEL SECURITY;

-- Seuls les admins/organisateurs peuvent voir (ici on simplifie pour les utilisateurs authentifiés)
CREATE POLICY "Authenticated users can view submissions" 
  ON public.tally_submissions FOR SELECT 
  TO authenticated 
  USING (true);

-- L'Edge Function utilisera la clé service_role pour insérer, donc pas besoin de policy INSERT publique
