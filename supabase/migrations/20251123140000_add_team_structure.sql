-- Table pour gérer les membres d'une équipe (liée à un utilisateur payant "Team")
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- L'admin de l'équipe
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Le membre invité (peut être NULL si invitation en attente)
  email TEXT NOT NULL, -- Email de l'invité
  role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
  status TEXT CHECK (status IN ('pending', 'active', 'declined')) DEFAULT 'pending',
  permissions JSONB DEFAULT '{}', -- Permissions spécifiques ex: {"can_create_tournament": true}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_owner_id, email)
);

-- RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Team Owner can do everything
CREATE POLICY "Team owners can manage their members"
  ON team_members
  FOR ALL
  USING (auth.uid() = team_owner_id);

-- Policy: Members can view their team membership
CREATE POLICY "Members can view their team membership"
  ON team_members
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Members can view co-members
CREATE POLICY "Members can view co-members"
  ON team_members
  FOR SELECT
  USING (
    team_owner_id IN (
      SELECT team_owner_id FROM team_members WHERE user_id = auth.uid()
    )
  );
