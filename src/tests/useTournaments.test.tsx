import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTournaments } from '../hooks/useTournaments';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock Supabase
const { mockSupabase } = vi.hoisted(() => {
  const mock = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: null,
            error: null
          }))
        }))
      }))
    }))
  };
  return { mockSupabase: mock };
});

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
  isSupabaseConfigured: vi.fn(() => true)
}));

// Mock Tournament Store
const { mockTournamentStore } = vi.hoisted(() => {
  return {
    mockTournamentStore: {
      tournaments: [],
      addTournament: vi.fn(),
      updateTournament: vi.fn(),
      deleteTournament: vi.fn()
    }
  };
});

vi.mock('../features/tournament/store/tournamentStore', () => ({
  useTournamentStore: vi.fn(() => mockTournamentStore)
}));

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
    vi.clearAllMocks();
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
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: mockData,
          error: null
        }))
      }))
    } as any));

    const { result } = renderHook(() => useTournaments(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('Test Tournament');
  });

  it('should handle Supabase errors gracefully', async () => {
    // Setup mock error
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: null,
          error: { message: 'Network error' }
        }))
      }))
    } as any));

    const { result } = renderHook(() => useTournaments(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
