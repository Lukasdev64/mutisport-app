import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: mock(() => Promise.resolve({
      data: { user: { id: 'test-user-id' } },
      error: null
    }))
  },
  from: mock(() => ({
    select: mock(() => ({
      eq: mock(() => ({
        order: mock(() => Promise.resolve({
          data: [],
          error: null
        }))
      })),
      order: mock(() => Promise.resolve({
        data: [],
        error: null
      }))
    })),
    insert: mock(() => ({
      select: mock(() => ({
        single: mock(() => Promise.resolve({
          data: null,
          error: null
        }))
      }))
    }))
  }))
};

mock.module('../lib/supabase', () => ({
  supabase: mockSupabase,
  isSupabaseConfigured: mock(() => true)
}));

// Mock Tournament Store
const mockTournamentStore = {
  tournaments: [],
  addTournament: mock(),
  updateTournament: mock(),
  updateMatch: mock(),
  archiveTournament: mock(),
  unarchiveTournament: mock(),
  deleteTournament: mock(),
  createTournament: mock(),
  getState: () => mockTournamentStore
};

mock.module('../features/tournament/store/tournamentStore', () => ({
  useTournamentStore: Object.assign(
    mock(() => mockTournamentStore),
    { getState: () => mockTournamentStore }
  )
}));

// Import hooks AFTER mocks
import { useTournaments, useCreateTournament, useUpdateTournament, useUpdateMatch, useArchiveTournament } from '../hooks/useTournaments';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTournaments', () => {
  beforeEach(() => {
    // Clear mocks if needed, though Bun mocks might need manual reset if reused
    // mock.restore() or similar if available, or just rely on fresh mocks per test if possible
    // For now, we just reset the implementation if we change it in tests
  });

  it('should fetch tournaments from Supabase when configured', async () => {
    const mockData = [
      {
        id: '1',
        name: 'Test Tournament',
        status: 'setup',
        format: 'single_elimination',
        sport: 'tennis',
        players_count: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        settings: {}
      }
    ];

    // Setup mock return - chain: from().select().eq().order()
    (mockSupabase.from as any).mockImplementation(() => ({
      select: mock(() => ({
        eq: mock(() => ({
          order: mock(() => Promise.resolve({
            data: mockData,
            error: null
          }))
        }))
      }))
    }));

    const { result } = renderHook(() => useTournaments(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('Test Tournament');
  });

  it('should handle Supabase errors gracefully', async () => {
    // Setup mock error - chain: from().select().eq().order()
    (mockSupabase.from as any).mockImplementation(() => ({
      select: mock(() => ({
        eq: mock(() => ({
          order: mock(() => Promise.resolve({
            data: null,
            error: { message: 'Network error' }
          }))
        }))
      }))
    }));

    const { result } = renderHook(() => useTournaments(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateTournament', () => {
  beforeEach(() => {
    // Reset mock calls
    (mockTournamentStore.updateTournament as any).mockClear?.();
  });

  it('should update local store and sync to Supabase', async () => {
    const updateMock = mock(() => ({
      eq: mock(() => Promise.resolve({ error: null }))
    }));

    (mockSupabase.from as any).mockImplementation(() => ({
      update: updateMock
    }));

    const { result } = renderHook(() => useUpdateTournament(), {
      wrapper: createWrapper()
    });

    result.current.mutate({
      id: 'test-id',
      updates: { name: 'Updated Tournament' }
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should have called local store update
    expect(mockTournamentStore.updateTournament).toHaveBeenCalledWith(
      'test-id',
      { name: 'Updated Tournament' }
    );
  });

  it('should map status values correctly for Supabase', async () => {
    let capturedUpdate: any = null;
    const updateMock = mock((data: any) => {
      capturedUpdate = data;
      return {
        eq: mock(() => Promise.resolve({ error: null }))
      };
    });

    (mockSupabase.from as any).mockImplementation(() => ({
      update: updateMock
    }));

    const { result } = renderHook(() => useUpdateTournament(), {
      wrapper: createWrapper()
    });

    result.current.mutate({
      id: 'test-id',
      updates: { status: 'active' }
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Status should be mapped: 'active' -> 'ongoing'
    expect(capturedUpdate?.status).toBe('ongoing');
  });
});

describe('useUpdateMatch', () => {
  beforeEach(() => {
    (mockTournamentStore.updateMatch as any).mockClear?.();
  });

  it('should update local store and sync match to Supabase', async () => {
    const updateMock = mock(() => ({
      eq: mock(() => Promise.resolve({ error: null }))
    }));

    (mockSupabase.from as any).mockImplementation(() => ({
      update: updateMock
    }));

    const { result } = renderHook(() => useUpdateMatch(), {
      wrapper: createWrapper()
    });

    result.current.mutate({
      tournamentId: 'tournament-1',
      matchId: 'match-1',
      data: {
        status: 'completed',
        result: {
          player1Score: 6,
          player2Score: 4,
          winnerId: 'player-1'
        }
      }
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should have called local store update
    expect(mockTournamentStore.updateMatch).toHaveBeenCalledWith(
      'tournament-1',
      'match-1',
      expect.objectContaining({
        status: 'completed',
        result: expect.objectContaining({
          winnerId: 'player-1'
        })
      })
    );
  });
});

describe('useArchiveTournament', () => {
  beforeEach(() => {
    (mockTournamentStore.archiveTournament as any).mockClear?.();
    (mockTournamentStore.unarchiveTournament as any).mockClear?.();
  });

  it('should archive tournament in local store and sync to Supabase', async () => {
    const updateMock = mock(() => ({
      eq: mock(() => Promise.resolve({ error: null }))
    }));

    (mockSupabase.from as any).mockImplementation(() => ({
      update: updateMock
    }));

    const { result } = renderHook(() => useArchiveTournament(), {
      wrapper: createWrapper()
    });

    result.current.mutate({ id: 'test-id', archived: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should have called archive
    expect(mockTournamentStore.archiveTournament).toHaveBeenCalledWith('test-id');
    expect(mockTournamentStore.unarchiveTournament).not.toHaveBeenCalled();
  });

  it('should unarchive tournament in local store and sync to Supabase', async () => {
    const updateMock = mock(() => ({
      eq: mock(() => Promise.resolve({ error: null }))
    }));

    (mockSupabase.from as any).mockImplementation(() => ({
      update: updateMock
    }));

    const { result } = renderHook(() => useArchiveTournament(), {
      wrapper: createWrapper()
    });

    result.current.mutate({ id: 'test-id', archived: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should have called unarchive
    expect(mockTournamentStore.unarchiveTournament).toHaveBeenCalledWith('test-id');
    expect(mockTournamentStore.archiveTournament).not.toHaveBeenCalled();
  });

  it('should continue even if Supabase sync fails', async () => {
    const updateMock = mock(() => ({
      eq: mock(() => Promise.resolve({ error: { message: 'Sync failed' } }))
    }));

    (mockSupabase.from as any).mockImplementation(() => ({
      update: updateMock
    }));

    const { result } = renderHook(() => useArchiveTournament(), {
      wrapper: createWrapper()
    });

    result.current.mutate({ id: 'test-id', archived: true });

    // Should still succeed (local update happened)
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Local store should still have been updated
    expect(mockTournamentStore.archiveTournament).toHaveBeenCalledWith('test-id');
  });
});
