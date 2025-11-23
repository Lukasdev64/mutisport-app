-- Table pour gérer les membres d'une équipe (liée à un utilisateur payant "Team")
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- L'admin qui a payé
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- Le membre invité
  role TEXT DEFAULT 'member', -- 'admin', 'editor', 'viewer'
  permissions JSONB DEFAULT '{}'::jsonb, -- Permissions spécifiques ex: {"can_create_competition": true}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_owner_id, user_id)
);

-- Activer RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Politiques RLS

-- 1. Le propriétaire de l'équipe (celui qui a le plan Team) peut tout faire sur ses membres
CREATE POLICY "Owners can manage their team members"
  ON team_members
  FOR ALL
  USING (auth.uid() = team_owner_id);

-- 2. Les membres peuvent voir dans quelle équipe ils sont
CREATE POLICY "Members can view their team membership"
  ON team_members
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Les membres d'une même équipe peuvent voir les autres membres (optionnel, utile pour la collab)
CREATE POLICY "Members can view co-members"
  ON team_members
  FOR SELECT
  USING (
    team_owner_id IN (
      SELECT team_owner_id FROM team_members WHERE user_id = auth.uid()
    )
  );
