import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock Supabase
const mockSupabase = {
  from: mock(() => ({
    select: mock(() => ({
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
  deleteTournament: mock()
};

mock.module('../features/tournament/store/tournamentStore', () => ({
  useTournamentStore: mock(() => mockTournamentStore)
}));

// Import hook AFTER mocks
import { useTournaments } from '../hooks/useTournaments';

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

    // Setup mock return
    (mockSupabase.from as any).mockImplementation(() => ({
      select: mock(() => ({
        order: mock(() => Promise.resolve({
          data: mockData,
          error: null
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
    // Setup mock error
    (mockSupabase.from as any).mockImplementation(() => ({
      select: mock(() => ({
        order: mock(() => Promise.resolve({
          data: null,
          error: { message: 'Network error' }
        }))
      }))
    }));

    const { result } = renderHook(() => useTournaments(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
