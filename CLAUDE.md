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
├── sports/             # Sport-specific logic (PLUGIN ARCHITECTURE)
│   ├── core/              # Plugin system infrastructure
│   │   ├── types.ts           # SportPlugin interface
│   │   ├── hooks.ts           # useSportPlugin, useSportConfig
│   │   ├── loader.ts          # Lazy loading utilities
│   │   └── SportPluginsProvider.tsx
│   ├── tennis/
│   │   ├── plugin.ts          # Tennis plugin definition
│   │   ├── scoring.ts         # TennisScoringEngine class
│   │   ├── config.ts          # Tennis configurations
│   │   ├── tournamentPresets.ts
│   │   └── components/        # Tennis-specific UI
│   │       ├── TennisMatchModalWrapper.tsx
│   │       └── TennisRulesModule.tsx
│   └── basketball/
│       ├── plugin.ts          # Basketball plugin definition
│       ├── scoring.ts
│       └── components/
│           └── BasketballMatchModalWrapper.tsx
├── store/              # Global Zustand stores
│   └── sportStore.ts   # Active sport + plugin registry (persisted)
├── hooks/              # React hooks
│   ├── useTournaments.ts
│   ├── useStripe.ts
│   └── useSportFilter.ts
├── types/              # TypeScript types
│   ├── tournament.ts   # Tournament (with sportConfig), Match, Player, Round
│   ├── tennis.ts       # TennisMatchScore, TennisGameScore
│   └── sport.ts        # SportType, SPORTS registry
├── components/         # Shared UI components
│   ├── sport/
│   │   ├── SportSwitcher.tsx    # Sidebar dropdown for switching sports (hot-switch)
│   │   └── SportSelector.tsx    # Full grid selector (Settings page)
│   └── layout/
│       └── Sidebar.tsx          # Main navigation with SportSwitcher
├── context/            # React contexts (SubscriptionContext)
├── lib/                # Third-party setup (supabase.ts)
└── tests/              # Bun tests
```

### State Management Strategy

```
Zustand (persisted to localStorage)
├── sportStore        → Active sport + plugin registry
├── tournamentStore   → Tournament data (local-first)
└── wizardStore       → Tournament creation wizard state

React Query (@tanstack/react-query)
└── Server state caching for tournaments

React Context
└── SubscriptionContext → User billing status
```

### Data Synchronization (Supabase)

The app uses a **local-first** approach: mutations update the Zustand store immediately for instant UI feedback, then sync to Supabase in the background.

**Mutation Hooks** (`src/hooks/useTournaments.ts`):

| Hook | Purpose | Supabase Table |
|------|---------|----------------|
| `useCreateTournament()` | Create tournament | `tournaments` |
| `useUpdateTournament()` | Update tournament | `tournaments` |
| `useUpdateMatch()` | Update match result | `tournament_matches` |
| `useArchiveTournament()` | Archive/unarchive | `tournaments` |

**Usage Pattern:**
```typescript
// In components - use hooks instead of direct store access
const updateMatchMutation = useUpdateMatch();

// Mutation updates local store first, then syncs to Supabase
updateMatchMutation.mutate({
  tournamentId: tournament.id,
  matchId: match.id,
  data: { status: 'completed', result: { winnerId: 'player-1' } }
});
```

**Status Mapping** (App ↔ Database):
- `draft` ↔ `setup`
- `active` ↔ `in_progress`
- `completed` ↔ `completed`

**Sport Type Convention**: Always use lowercase (`tennis`, `basketball`) - the database stores lowercase values.

**Error Handling**: Supabase sync failures are logged but don't block the UI - local changes persist.

### Sport Plugin Architecture

The app uses a **modular plugin system** for sport-specific functionality. Each sport is a self-contained plugin that provides components, scoring logic, and configuration.

**Core Concepts:**
- `SportPlugin` interface defines what each sport must provide
- Plugins are registered at app startup via `SportPluginsProvider`
- Components use hooks (`useSportPlugin`, `useSportConfig`) to access sport-specific logic
- Backward compatible with legacy `tennisConfig` field

**Plugin Structure** (`src/sports/core/types.ts`):
```typescript
interface SportPlugin {
  id: SportType;
  sport: Sport;
  defaultConfig: unknown;
  presets?: SportPreset[];           // Quick configuration presets
  components: {
    MatchModal: ComponentType;       // Required: match result entry
    RulesModule?: ComponentType;     // Optional: rules display
    RulesCustomizer?: ComponentType; // Optional: rules editor
  };
  scoringEngine?: {
    initializeMatch: (config) => Score;
    getWinner: (score) => string | undefined;
    getScoreDisplay: (score) => string;
  };
}
```

**Adding a New Sport:**
1. Create folder `src/sports/[sport]/`
2. Create `plugin.ts` implementing `SportPlugin`
3. Create wrapper components in `components/`
4. Register in `SportPluginsProvider.tsx`

**Example - Creating Football Plugin:**
```typescript
// src/sports/football/plugin.ts
export const footballPlugin: SportPlugin = {
  id: 'football',
  sport: SPORTS.football,
  defaultConfig: { halfDuration: 45, extraTimeEnabled: true },
  components: {
    MatchModal: FootballMatchModalWrapper,
  },
  scoringEngine: {
    initializeMatch: () => ({ homeScore: 0, awayScore: 0 }),
    getWinner: (s) => s.homeScore > s.awayScore ? 'home' : s.awayScore > s.homeScore ? 'away' : undefined,
    getScoreDisplay: (s) => `${s.homeScore} - ${s.awayScore}`,
  },
};
```

**Key Hooks:**
- `useSportPlugin(sportId?)` - Get plugin for sport or active sport
- `useSportConfig<T>(tournament)` - Get typed config from tournament
- `useSportComponents(sportId?)` - Get plugin UI components
- `useHasPlugin(sportId)` - Check if plugin is registered

**Sport Switching UI:**
- `SportSwitcher` (sidebar) - Compact dropdown for quick switching, uses hot-switch (no page reload)
- `SportSelector` (settings page) - Full grid view of all sports
- Active sport is persisted to localStorage via `sportStore`
- All sport-filtered components auto-update via Zustand selectors

**Provider Hierarchy** (`src/App.tsx`):
```
ToastProvider → SportPluginsProvider → SubscriptionProvider → Router
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
ToastProvider → SportPluginsProvider → SubscriptionProvider → NotificationProvider → Router → Layout → Pages
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

## Debugging Tips

### Check Persisted State
```typescript
// In browser console
localStorage.getItem('tournament-storage')
localStorage.getItem('sport-storage')
```

### React Query DevTools
```tsx
// Install: bun add @tanstack/react-query-devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Add to providers
<ReactQueryProvider>
  {children}
  <ReactQueryDevtools />
</ReactQueryProvider>
```

### Run Single Test
```bash
bun test src/tests/tennisScoring.test.ts
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.x | UI Framework |
| typescript | ~5.9 | Type Safety |
| vite | 7.x | Build Tool |
| tailwindcss | 4.x | Styling |
| zustand | 5.x | State Management |
| @tanstack/react-query | 5.x | Server State |
| @supabase/supabase-js | 2.x | Backend |
| framer-motion | 12.x | Animations |
| @stripe/react-stripe-js | 5.x | Payments |
