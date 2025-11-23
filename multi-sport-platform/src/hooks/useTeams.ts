import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TeamMember, CreateTeamMemberDTO, UpdateTeamMemberDTO } from '@/types/team';
import type { Json } from '@/types/supabase';

// Helper to get typed table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const teamMembersTable = () => supabase.from('team_members' as any);

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await teamMembersTable()
        .select('*')
        .eq('team_owner_id', user.id);

      if (error) throw error;
      return data as unknown as TeamMember[];
    }
  });
};

export const useInviteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMember: CreateTeamMemberDTO) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (teamMembersTable() as any)
        .insert({
          email: newMember.email,
          role: newMember.role,
          permissions: newMember.permissions as unknown as Json,
          team_owner_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TeamMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    }
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTeamMemberDTO }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (teamMembersTable() as any)
        .update({
          ...updates,
          permissions: updates.permissions as unknown as Json
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TeamMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    }
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await teamMembersTable()
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    }
  });
};
