export type TeamRole = 'admin' | 'editor' | 'viewer';
export type TeamMemberStatus = 'pending' | 'active' | 'declined';

export interface TeamMemberPermissions {
  can_create_tournament?: boolean;
  can_edit_tournament?: boolean;
  can_delete_tournament?: boolean;
  can_manage_members?: boolean;
}

export interface TeamMember {
  id: string;
  team_owner_id: string;
  user_id: string | null;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  permissions: TeamMemberPermissions;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamMemberDTO {
  email: string;
  role: TeamRole;
  permissions?: TeamMemberPermissions;
}

export interface UpdateTeamMemberDTO {
  role?: TeamRole;
  permissions?: TeamMemberPermissions;
}
