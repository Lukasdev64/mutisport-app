-- Ajouter les colonnes pour Stripe dans la table profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free', -- 'active', 'past_due', 'canceled', 'free'
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free', -- 'free', 'premium'
ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMP WITH TIME ZONE;

-- Index pour rechercher rapidement par customer_id (utile pour les webhooks)
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
