# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-Sport Platform is a React 19 + TypeScript application for managing sports tournaments (tennis, basketball). Uses Bun runtime, Vite, Supabase backend, Stripe payments, and Zustand state management.

## Development Commands

```bash
# Install dependencies (uses Bun)
bun install

# Start dev server (http://localhost:5173)
bun run dev

# Production build
bun run build

# Run tests
bun test
bun test:watch      # Watch mode
bun test:coverage   # With coverage

# Linting
bun run lint
```

## Environment Setup

Copy `.env.example` to `.env` and configure:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

If credentials are missing, the app falls back to localStorage with mock Supabase responses (see `src/lib/supabase.ts`).

## Architecture

### Feature-Based Structure

```
src/
├── features/           # Feature modules (main code organization)
│   ├── tournament/     # Tournament system (largest feature)
│   │   ├── components/
│   │   │   ├── arena/     # Live tournament view
│   │   │   ├── wizard/    # Multi-step creation
│   │   │   ├── registration/
│   │   │   └── scheduling/
│   │   ├── logic/         # Business logic
│   │   │   ├── engine.ts          # TournamentEngine: bracket generation
│   │   │   ├── schedulingEngine.ts
│   │   │   └── selectionAlgorithm.ts
│   │   └── store/         # Zustand stores
│   │       ├── tournamentStore.ts
│   │       └── wizardStore.ts
│   ├── billing/        # Stripe subscriptions
│   ├── dashboard/      # Main dashboard
│   ├── players/        # Player management
│   ├── teams/          # Team management
│   └── settings/
├── sports/             # Sport-specific logic
│   ├── tennis/
│   │   ├── scoring.ts         # TennisScoringEngine class
│   │   ├── config.ts          # Tennis configurations
│   │   └── tournamentPresets.ts
│   └── basketball/
│       └── scoring.ts
├── store/              # Global Zustand stores
│   └── sportStore.ts   # Active sport selection (persisted)
├── hooks/              # React hooks
│   ├── useTournaments.ts
│   ├── useStripe.ts
│   └── useSportFilter.ts
├── types/              # TypeScript types
│   ├── tournament.ts   # Tournament, Match, Player, Round
│   ├── tennis.ts       # TennisMatchScore, TennisGameScore
│   └── sport.ts        # SportType, SPORTS registry
├── components/         # Shared UI components
├── context/            # React contexts (SubscriptionContext)
├── lib/                # Third-party setup (supabase.ts)
└── tests/              # Bun tests
```

### State Management Strategy

```
Zustand (persisted to localStorage)
├── sportStore        → Active sport selection
├── tournamentStore   → Tournament data
└── wizardStore       → Tournament creation wizard state

React Query (@tanstack/react-query)
└── Server state caching for tournaments

React Context
└── SubscriptionContext → User billing status
```

### Key Classes

**TournamentEngine** (`src/features/tournament/logic/engine.ts`):
- `generateBracket(players, format)` - Creates brackets for single_elimination, round_robin, swiss
- `generateSwissRound(tournament, roundNumber)` - Dynamic Swiss pairing
- `getStandings(tournament)` - Calculate standings from match results

**TennisScoringEngine** (`src/sports/tennis/scoring.ts`):
- `awardPoint(score, playerId)` - Point progression with deuce/advantage
- `awardGame/awardSet(score, playerId)` - Game/set progression
- `awardTiebreakPoint(score, playerId)` - Tiebreak handling
- `initializeMatch(config)` - Create initial score state
- `getScoreDisplay(score)` / `getGameScoreDisplay(game)` - Human-readable scores

### Routes

```
/                    → Landing page
/dashboard           → Sport-filtered dashboard
/tournaments         → Tournament listing
/tournaments/new     → Creation wizard
/tournaments/:id     → Live tournament arena
/players             → Player management
/teams               → Team management
/billing             → Stripe billing
/settings            → User settings
```

### Lazy Loading

All pages use React lazy loading with Suspense (see `src/App.tsx`):
```typescript
const TournamentArenaPage = lazy(() => import('@/features/tournament/TournamentArenaPage').then(module => ({ default: module.TournamentArenaPage })));
```

### Path Alias

Use `@/` for imports from `src/`:
```typescript
import { TournamentEngine } from '@/features/tournament/logic/engine';
import type { Match } from '@/types/tournament';
```

## Testing

Test files in `src/tests/`:
- `bracketGeneration.test.ts` - Tournament bracket algorithms
- `tennisScoring.test.ts` - Tennis scoring engine
- `matchService.test.ts` - Match operations
- `useTournaments.test.tsx` - React hooks (uses happy-dom)

Run single test file:
```bash
bun test src/tests/tennisScoring.test.ts
```

## Key Patterns

**Provider Hierarchy** (`src/App.tsx`):
```
ToastProvider → SubscriptionProvider → Router → Layout → Pages
```

**Tournament Formats**:
- `single_elimination` - Standard bracket
- `round_robin` - All vs all
- `swiss` - Progressive pairing by score
- `double_elimination` - (TODO)

**Tennis Scoring Flow**:
1. `awardPoint()` → checks for game win → calls `awardGame()`
2. `awardGame()` → checks for set win (or tiebreak) → calls `awardSet()`
3. `awardSet()` → checks for match win → sets `isComplete: true, winnerId`

## Supabase

Project: `multi-sport` (ubmkyocqhaunemrzmfyb) - Region: eu-west-1

### Database Schema

All tables have RLS enabled. Main tables:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profiles (linked to auth.users) | stripe_customer_id, subscription_plan, subscription_status |
| `tournaments` | Tournament metadata | format, status, bracket_data (JSONB), match_results (JSONB) |
| `tournament_players` | Players in tournaments | seed, wins/losses/draws/points, buchholz_score, opponents (JSONB) |
| `tournament_rounds` | Tournament rounds | round_number, round_type, status |
| `tournament_matches` | Individual matches | player1/2_id, winner_id, next_match_id, loser_next_match_id, details (JSONB) |
| `tournament_files` | Tournament documents | category (rules/schedule/results/photo/document/other) |
| `anonymous_tournaments` | Quick tournaments (no auth) | unique_url_code, expires_at (30 days default) |
| `competitions` | Legacy competitions | organizer_id, max_participants, age_category |
| `team_members` | Team collaboration | team_owner_id, user_id, role, permissions (JSONB) |

**Status Enums**:
- Tournament: `draft` | `upcoming` | `ongoing` | `completed` | `cancelled`
- Match: `pending` | `in_progress` | `completed` | `cancelled`
- Player: `pending` | `confirmed` | `rejected` | `withdrawn`
- Round type: `winners` | `losers` | `finals` | `third-place` | `round-robin` | `swiss`

### Edge Functions

| Function | JWT | Purpose |
|----------|-----|---------|
| `create-checkout-session` | ✓ | Stripe checkout session creation |
| `create-subscription` | ✓ | Stripe subscription management |
| `stripe-webhook` | ✓ | Handle Stripe events |
| `invite-team-member` | ✗ | Team invitation emails |
| `tally-webhook` | ✗ | Tally form submissions |

### Realtime

Used for live subscription updates (see `SubscriptionContext.tsx`):
```typescript
supabase.channel('name')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, callback)
  .subscribe();
```

### Fallback Mode

If env vars missing, `src/lib/supabase.ts` returns mock client - app works offline with localStorage.
