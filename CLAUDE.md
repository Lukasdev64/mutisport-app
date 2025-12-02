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

# For RAG knowledge base seeding (seed-knowledge.ts)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
```

If credentials are missing, the app falls back to localStorage with mock Supabase responses (see `src/lib/supabase.ts`).

## Architecture

### Feature-Based Structure

```
src/
├── features/           # Feature modules (main code organization)
│   ├── tournament/     # Tournament system (largest feature)
│   │   ├── components/
│   │   │   ├── arena/        # Live tournament view
│   │   │   ├── wizard-hub/   # Sport selection entry point
│   │   │   │   └── SportSelectionHub.tsx
│   │   │   ├── registration/
│   │   │   └── scheduling/
│   │   ├── logic/            # Business logic
│   │   │   ├── engine.ts          # TournamentEngine: bracket generation
│   │   │   ├── schedulingEngine.ts
│   │   │   └── selectionAlgorithm.ts
│   │   └── store/            # Zustand stores
│   │       └── tournamentStore.ts
│   ├── billing/        # Stripe subscriptions
│   ├── dashboard/      # Main dashboard
│   ├── players/        # Player management
│   ├── teams/          # Team management
│   ├── rules/          # Sport rules library (multi-sport)
│   │   ├── RulesLibraryPage.tsx    # Main page with WIP support
│   │   ├── RuleDetailPage.tsx      # Single rule detail
│   │   └── components/             # Reusable components
│   └── settings/
├── sports/             # Sport-specific logic (PLUGIN ARCHITECTURE)
│   ├── core/              # Plugin system infrastructure
│   │   ├── types.ts           # SportPlugin interface
│   │   ├── hooks.ts           # useSportPlugin, useSportConfig
│   │   ├── loader.ts          # Lazy loading utilities
│   │   ├── rulesRegistry.ts   # Central rules registry for all sports
│   │   └── SportPluginsProvider.tsx
│   ├── tennis/
│   │   ├── plugin.ts          # Tennis plugin definition
│   │   ├── scoring.ts         # TennisScoringEngine class
│   │   ├── config.ts          # Tennis configurations
│   │   ├── tournamentPresets.ts
│   │   ├── wizard/            # Tennis-specific wizard (ISOLATED)
│   │   │   ├── store.ts           # Dedicated Zustand store
│   │   │   ├── TennisWizardPage.tsx
│   │   │   └── steps/             # Wizard step components
│   │   ├── rules/             # Tennis rules library (ITF 2025)
│   │   │   ├── index.ts
│   │   │   └── fallbackData.ts    # Offline rules data
│   │   └── components/        # Tennis-specific UI
│   │       ├── TennisMatchModalWrapper.tsx
│   │       └── TennisRulesModule.tsx
│   └── basketball/
│       ├── plugin.ts          # Basketball plugin definition
│       ├── scoring.ts
│       ├── wizard/            # Basketball wizard (WIP)
│       │   └── BasketballWizardPage.tsx
│       ├── rules/             # Basketball rules (WIP template)
│       │   ├── index.ts
│       │   ├── categories.ts      # Category definitions
│       │   └── fallbackData.ts    # Fallback rules data
│       └── components/
│           └── BasketballMatchModalWrapper.tsx
├── store/              # Global Zustand stores
│   └── sportStore.ts   # Active sport + plugin registry (persisted)
├── hooks/              # React hooks
│   ├── useTournaments.ts
│   ├── useRules.ts         # Rules library hooks (multi-sport)
│   ├── useStripe.ts        # useCreateCheckoutSession, useStripePortal
│   └── useSportFilter.ts
├── types/              # TypeScript types
│   ├── tournament.ts   # Tournament (with sportConfig), Match, Player, Round
│   ├── tennis.ts       # TennisMatchScore, TennisGameScore
│   ├── rules.ts        # SportRule, RuleCategory, RULES_IMPLEMENTATION_STATUS
│   └── sport.ts        # SportType, SPORTS registry
├── components/         # Shared UI components
│   ├── common/
│   │   └── SupportChat.tsx      # RAG-powered floating chat widget
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
├── sportStore              → Active sport + plugin registry
├── tournamentStore         → Tournament data (local-first)
└── Sport-specific wizard stores:
    ├── tennisWizardStore   → Tennis wizard state (tennis-wizard-storage)
    └── [sport]WizardStore  → Each sport has its own isolated store

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
- `draft` ↔ `draft`
- `active` ↔ `ongoing`
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

### Sport Implementation Status

The wizard uses an **implementation status system** to prevent incomplete sports from contaminating the user experience. This ensures tennis-specific features don't leak into other sports.

**Status Types** (`src/types/sport.ts`):
```typescript
type SportImplementationStatus = 'implemented' | 'partial' | 'wip';
```

**Current Status Matrix:**

| Sport | Status | Wizard | Quick Start | Rules Customizer |
|-------|--------|--------|-------------|------------------|
| Tennis | `implemented` | Full | Yes | Yes |
| Basketball | `partial` | Format only | No (link to wizard) | Coming soon |
| Football | `wip` | Blocked | No | No |
| Ping Pong | `wip` | Blocked | No | No |
| Chess | `wip` | Blocked | No | No |
| Generic | `wip` | Blocked | No | No |

**Helper Functions:**
```typescript
import { isSportImplemented, isSportUsable, getImplementationStatusLabel } from '@/types/sport';

// Check if sport has full wizard support
isSportImplemented('tennis')     // true
isSportImplemented('basketball') // false

// Check if sport can be used (implemented or partial)
isSportUsable('basketball')      // true
isSportUsable('football')        // false

// Get UI label for badges
getImplementationStatusLabel('partial') // "Beta"
getImplementationStatusLabel('wip')     // "Bientot"
```

**UI Behavior:**
- **TournamentSetup**: WIP sports show "Bientot" badge and are disabled
- **FormatAndRules**: Partial sports show info banner, no rules customizer
- **QuickStartScreen**: Tennis-only, links to wizard for other sports

**Adding Support for a New Sport:**
1. Update `SPORT_IMPLEMENTATION_STATUS` in `src/types/sport.ts`
2. Create wizard components in `src/sports/[sport]/wizard/`
3. Register components in the sport plugin
4. Update status from `wip` → `partial` → `implemented`

### Sport Rules Library Architecture

The app includes a **modular rules library** that displays official sport rules. Each sport can have its own rules with categories, full-text search, and fallback data for offline mode.

**Implementation Status** (`src/types/rules.ts`):
```typescript
type RulesImplementationStatus = 'implemented' | 'partial' | 'wip';

const RULES_IMPLEMENTATION_STATUS: Record<SportType, RulesImplementationStatus> = {
  tennis: 'implemented',    // Full ITF rules library
  basketball: 'wip',        // Coming soon
  football: 'wip',          // Coming soon
  ping_pong: 'wip',         // Coming soon
  chess: 'wip',             // Coming soon
  generic: 'wip'            // N/A
};
```

**Current Status Matrix:**

| Sport | Rules Status | Categories | Fallback Data | Source |
|-------|--------------|------------|---------------|--------|
| Tennis | `implemented` | 9 categories | 15+ rules | ITF Rules 2025 |
| Basketball | `wip` | - | - | FIBA Rules 2024 |
| Football | `wip` | - | - | FIFA Laws 2024 |
| Ping Pong | `wip` | - | - | ITTF Handbook 2024 |
| Chess | `wip` | - | - | FIDE Laws 2024 |

**File Structure:**
```
src/
├── types/
│   └── rules.ts                    # Core types + status + TENNIS_RULE_CATEGORIES
├── hooks/
│   └── useRules.ts                 # React Query hooks for rules
├── features/rules/
│   ├── RulesLibraryPage.tsx        # Main rules page (multi-sport)
│   ├── RuleDetailPage.tsx          # Single rule view
│   └── components/                 # Reusable UI components
└── sports/
    ├── core/
    │   └── rulesRegistry.ts        # Central registry for all sports
    ├── tennis/rules/
    │   ├── index.ts
    │   └── fallbackData.ts         # ITF rules for offline mode
    └── basketball/rules/           # WIP template
        ├── index.ts
        ├── categories.ts           # Category definitions
        └── fallbackData.ts         # Fallback rules data
```

**Rules Registry** (`src/sports/core/rulesRegistry.ts`):
```typescript
// Get categories for a sport
import { getRuleCategoriesForSport, hasCategoriesForSport } from '@/sports/core/rulesRegistry';
const categories = getRuleCategoriesForSport('tennis'); // RuleCategory[]

// Get fallback data for offline mode
import { getFallbackRulesForSport, getFallbackRuleBySlug } from '@/sports/core/rulesRegistry';
const rules = getFallbackRulesForSport('tennis'); // SportRule[]

// Get official source info
import { getRulesSource } from '@/sports/core/rulesRegistry';
const source = getRulesSource('tennis'); // { name: 'ITF Rules of Tennis', url: '...', year: '2025' }
```

**Helper Functions:**
```typescript
import { hasRulesImplemented, hasRulesAvailable, getRulesStatusLabel } from '@/types/rules';

// Check if sport has full rules library
hasRulesImplemented('tennis')     // true
hasRulesImplemented('basketball') // false

// Check if sport has any rules (implemented or partial)
hasRulesAvailable('basketball')   // false
hasRulesAvailable('tennis')       // true

// Get UI label for badges
getRulesStatusLabel('wip')        // "Bientot"
getRulesStatusLabel('partial')    // "Partiel"
```

**UI Behavior:**
- **RulesLibraryPage**: Adapts to active sport, shows WIP banner if rules not available
- **Sidebar**: Rules link visible for all sports, content varies by implementation status
- **Search**: Full-text search works with fallback data when Supabase unavailable

**Adding Rules for a New Sport:**
1. Create folder `src/sports/[sport]/rules/`
2. Create `categories.ts` with `RuleCategory[]` definitions
3. Create `fallbackData.ts` with `SportRule[]` for offline mode
4. Create `index.ts` exporting both
5. Register in `src/sports/core/rulesRegistry.ts`:
   - Add to `SPORT_RULE_CATEGORIES`
   - Add to `SPORT_FALLBACK_RULES`
   - Add source info to `RULES_SOURCES`
6. Update `RULES_IMPLEMENTATION_STATUS` in `src/types/rules.ts`

**Example - Adding Basketball Rules:**
```typescript
// src/sports/basketball/rules/categories.ts
export const BASKETBALL_RULE_CATEGORIES: RuleCategory[] = [
  { id: 'court', name: 'Le Terrain', icon: 'Square', color: 'orange', displayOrder: 1 },
  { id: 'scoring', name: 'Le Scoring', icon: 'Target', color: 'emerald', displayOrder: 2 },
  // ...
];

// src/sports/basketball/rules/fallbackData.ts
export const BASKETBALL_FALLBACK_RULES: SportRule[] = [
  {
    id: 'court-1',
    sport: 'basketball',
    categoryId: 'court',
    categoryName: 'Le Terrain',
    title: 'Dimensions du Terrain',
    // ...
  },
];

// Then register in rulesRegistry.ts and update status to 'implemented'
```

### Sport-Specific Wizard Architecture

Each sport has its own **completely isolated wizard** for tournament creation. This ensures sport-specific logic doesn't contaminate other sports.

**Route Structure:**
```
/tournaments/new                → SportSelectionHub (choose sport)
/tournaments/new/tennis         → TennisWizardPage (tennis-specific)
/tournaments/new/basketball     → BasketballWizardPage (WIP placeholder)
```

**File Structure:**
```
src/
├── features/tournament/components/wizard-hub/
│   └── SportSelectionHub.tsx    # Entry point - sport selection
└── sports/
    ├── tennis/wizard/
    │   ├── index.ts             # Exports
    │   ├── store.ts             # Tennis-specific Zustand store
    │   ├── TennisWizardPage.tsx # Main wizard orchestrator
    │   └── steps/
    │       ├── TennisModeSelection.tsx     # Quick/Instant/Planned
    │       ├── TennisTournamentSetup.tsx   # Name, date, venue
    │       ├── TennisFormatAndRules.tsx    # Presets, rules, format
    │       ├── TennisPlayerSelection.tsx   # Add players
    │       ├── TennisSummary.tsx           # Review & launch
    │       └── TennisQuickStart.tsx        # One-page quick creation
    └── basketball/wizard/
        ├── index.ts
        └── BasketballWizardPage.tsx        # WIP placeholder
```

**Tennis Wizard Store** (`src/sports/tennis/wizard/store.ts`):
```typescript
interface TennisWizardState {
  mode: TennisWizardMode;              // 'selection' | 'quickstart' | 'instant' | 'planned'
  step: number;
  name: string;
  date: string | null;
  venue: string;
  format: TournamentFormat;
  presetId: string | null;             // Tennis preset (BO3, BO5, etc.)
  config: TennisMatchConfig | null;    // Tennis-specific rules
  players: WizardPlayer[];
  // ... actions
}
```

**Adding a New Sport Wizard:**
1. Create folder `src/sports/[sport]/wizard/`
2. Create dedicated Zustand store with sport-specific fields
3. Create `[Sport]WizardPage.tsx` as main orchestrator
4. Create step components in `steps/` folder
5. Create `index.ts` with exports
6. Add route in `App.tsx`
7. Update `SportSelectionHub.tsx` to link to the new wizard

**Key Principles:**
- **Complete isolation**: No shared state between sport wizards
- **Sport-specific stores**: Each wizard has its own persisted Zustand store
- **WIP placeholders**: Non-implemented sports show informative placeholder pages
- **Hub-based navigation**: User selects sport first, then enters dedicated wizard

**Wizard Navigation Hook** (`src/hooks/useWizardNavigation.ts`):

Routes "Create Tournament" buttons to the correct wizard and blocks WIP sports:

```typescript
import { useWizardNavigation, getWizardUrl, canCreateTournament, getWizardStatusLabel } from '@/hooks/useWizardNavigation';

// In components with access to active sport
const { wizardUrl, canCreate, statusLabel } = useWizardNavigation();

// Or use standalone functions
getWizardUrl('tennis')           // '/tournaments/new/tennis'
getWizardUrl('football')         // '/tournaments/new' (hub - WIP)
canCreateTournament('tennis')    // true
canCreateTournament('basketball') // false (partial)
getWizardStatusLabel('tennis')   // null
getWizardStatusLabel('basketball') // 'Beta'
getWizardStatusLabel('football') // 'Bientot'
```

| Sport | `canCreate` | `statusLabel` | Button State |
|-------|-------------|---------------|--------------|
| Tennis | `true` | `null` | Active (blue) |
| Basketball | `false` | `"Beta"` | Disabled + badge |
| Football | `false` | `"Bientot"` | Disabled + badge |

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
/                              → Landing page
/dashboard                     → Sport-filtered dashboard
/tournaments                   → Tournament listing
/tournaments/new               → Sport Selection Hub
/tournaments/new/tennis        → Tennis wizard (fully implemented)
/tournaments/new/basketball    → Basketball wizard (WIP placeholder)
/tournaments/:id               → Live tournament arena
/players                       → Player management
/teams                         → Team management
/rules                         → Sport rules library (multi-sport, WIP-aware)
/rules/:categoryId             → Rules by category
/rules/:categoryId/:slug       → Single rule detail
/billing                       → Stripe billing
/settings                      → User settings
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
- `sportImplementation.test.ts` - Sport implementation status system
- `wizardNavigation.test.ts` - Sport-specific wizard navigation

Run single test file:
```bash
bun test src/tests/tennisScoring.test.ts
```

Run all tests:
```bash
bun test
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
| `documents` | RAG knowledge base (pgvector) | content, metadata (JSONB), embedding vector(1536) |
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
| `create-stripe-portal` | ✗ | Stripe billing portal session (manage subscription) |
| `create-subscription` | ✓ | Stripe subscription management |
| `stripe-webhook` | ✓ | Handle Stripe events |
| `chat-bot` | ✗ | RAG-powered support chatbot (OpenAI + pgvector) |
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

### RAG Support (Knowledge Base)

The app includes a **RAG (Retrieval-Augmented Generation)** system for the support chatbot.

**Components:**
- `documents` table with pgvector embeddings (1536 dimensions)
- `match_documents()` SQL function for similarity search
- `chat-bot` Edge Function using OpenAI + pgvector
- `seed-knowledge.ts` script for seeding the knowledge base

**Seeding the Knowledge Base:**
```bash
# Requires OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
bun run seed-knowledge.ts
```

**SQL Function:**
```sql
-- Returns documents matching a query embedding above threshold
select * from match_documents(
  query_embedding := '[...]'::vector(1536),
  match_threshold := 0.7,
  match_count := 5
);
```

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

## React Best Practices

### Controlled Inputs
Always pair `value` with `onChange` - otherwise typing is impossible:
```tsx
// BAD - can't type
<input value={name} />

// GOOD
<input value={name} onChange={(e) => setName(e.target.value)} />
```

### Button Types in Forms
Buttons without `type` default to `submit` - use explicit types:
```tsx
<button type="button">Cancel</button>     // Won't submit form
<button type="submit">Save</button>       // Will submit form
```

### Refs Are Escape Hatches
If much of your logic relies on refs, rethink your approach. Use refs for:
- DOM measurements
- Focus management
- Third-party library integration

**Not for:** Application state, data flow, or preventing re-renders.

## Zustand Best Practices

### Use Selectors to Prevent Re-renders
```typescript
// BAD - re-renders on ANY store change (wizard has 30+ properties!)
const store = useWizardStore();

// GOOD - re-renders only when tournaments change
const tournaments = useTournamentStore((s) => s.tournaments);
```

**Functional benefit:** Without selectors, typing in a form field triggers re-renders of unrelated components, causing lag and jank.

### Separate State Values from Actions
```typescript
import { useShallow } from 'zustand/react/shallow';

// STATE VALUES - use useShallow (can change, trigger re-renders)
const { format, players, status } = useWizardStore(
  useShallow((s) => ({
    format: s.format,
    players: s.players,
    status: s.status
  }))
);

// ACTIONS - individual selectors, NO useShallow needed (stable references)
const setFormat = useWizardStore((s) => s.setFormat);
const setPlayers = useWizardStore((s) => s.setPlayers);
```

**Why actions don't need useShallow:** Zustand store functions are stable references - they never change between renders, so selecting them individually is safe and efficient.

### Derive Computed Values with Selectors
```typescript
// Don't store derived data - compute it
const activeTournaments = useTournamentStore(
  (s) => s.tournaments.filter(t => t.status === 'active')
);
```

## TanStack Query Best Practices

### Never Mutate Cache Directly
```typescript
// BAD - mutating cache in place
queryClient.setQueryData(['tournaments'], (old) => {
  old.push(newTournament); // DON'T DO THIS
  return old;
});

// GOOD - return new reference
queryClient.setQueryData(['tournaments'], (old) =>
  old ? [...old, newTournament] : [newTournament]
);
```

### setQueryData vs invalidateQueries

| Method | Use when | Performance |
|--------|----------|-------------|
| `setQueryData` | Mutation response contains all needed data | Instant (no network) |
| `invalidateQueries` | Need fresh data from server | ~100-300ms (network) |

```typescript
// USE setQueryData - we have the complete object
onSuccess: (newTournament) => {
  queryClient.setQueryData(['tournaments'], (old) =>
    old ? [newTournament, ...old] : [newTournament]
  );
}

// USE invalidateQueries - server computes derived data we don't have
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['standings'] });
}
```

**Functional benefit:** `setQueryData` makes the UI feel instant - no loading spinners, no flicker.

### Always Use `mutationKey`
```typescript
const updateMatch = useMutation({
  mutationKey: ['tournaments', 'match', 'update'],  // Required!
  mutationFn: (data) => updateMatchInDb(data),
});
```

**Functional benefits of `mutationKey`:**
- **DevTools visibility**: See "tournaments.match.update" instead of "unknown mutation"
- **Deduplication**: Two identical calls are merged automatically
- **Targeted invalidation**: `queryClient.cancelMutations({ mutationKey: ['tournaments'] })`
- **Retry identification**: The system can identify and retry specific mutations

## Supabase & RLS Best Practices

### Defense-in-Depth: Explicit Filters + RLS

**Always add explicit user filters, even with RLS enabled:**

```typescript
// Get current user first
const { data: { user } } = await supabase.auth.getUser();

// Add explicit filter PLUS rely on RLS
const { data } = await supabase
  .from('tournaments')
  .select('*')
  .eq('organizer_id', user?.id)  // Explicit filter
  .order('created_at', { ascending: false });
```

**Why both?**
| Protection | What it catches |
|------------|-----------------|
| RLS policy | Malicious API calls, SQL injection attempts |
| Explicit filter | RLS misconfiguration, policy disabled by accident |

**Functional benefit:** If someone accidentally disables RLS, data doesn't leak - the client filter still works. It also makes the query intent explicit in code reviews.

### Wrap `auth.uid()` in SELECT for Performance
```sql
-- BAD - function called per row
CREATE POLICY "Users can view own data" ON tournaments
  FOR SELECT USING (auth.uid() = user_id);

-- GOOD - function cached via initPlan
CREATE POLICY "Users can view own data" ON tournaments
  FOR SELECT USING ((select auth.uid()) = user_id);
```

### Verify Ownership in Mutations
```typescript
// For UPDATE/DELETE - always verify ownership
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('Not authenticated');

await supabase
  .from('team_members')
  .update({ role: 'admin' })
  .eq('id', memberId)
  .eq('team_owner_id', user.id);  // Defense-in-depth
```

### Disable RLS for Public Tables
For insensitive data (public leaderboards, etc.), RLS adds overhead without benefit.

## TypeScript Best Practices

### Avoid `any` Types

**Never use `any` in business logic or UI code.** The `any` type disables TypeScript's type checking, hiding bugs until runtime.

```typescript
// BAD - bugs hidden until runtime
const player: any = { name: "Alice" };
player.email.toLowerCase(); // Runtime crash! email is undefined

// GOOD - TypeScript catches the bug at compile time
const player: Player = { name: "Alice" };
player.email?.toLowerCase(); // TypeScript warns: email might be undefined
```

**Acceptable uses of `any`:**
- **Supabase boundary** (`useTournaments.ts`, `useTeams.ts`) - Supabase types are incomplete
- **Test mocking** - Mocks often require `any` for flexibility
- **External library workarounds** - When library types are wrong

**Alternatives to `any`:**
| Instead of | Use |
|------------|-----|
| `any` | `unknown` + type narrowing |
| `as any` | Proper type assertion or interface extension |
| `param: any` | Generic `<T>` or union types |
| `obj as any` | Type guard function |

**Example - Type-safe Supabase payload:**
```typescript
// Define the shape you expect
interface MatchRow {
  id: string;
  [key: string]: unknown;
}

// Use with Supabase Realtime
type MatchChangePayload = RealtimePostgresChangesPayload<MatchRow>;

const handleChange = (payload: MatchChangePayload) => {
  const record = payload.new as MatchRow | undefined;
  const matchId = record?.id || '';
};
```

### Type Mapping Helpers

When converting between different type systems (wizard → tournament, app → database):

```typescript
// Create explicit mapping functions instead of casting
const mapWizardSportToSportType = (wizardSport: string): SportType => {
  if (wizardSport === 'other') return 'generic';
  return wizardSport as SportType;
};

// Status mapping (App ↔ Database)
const dbStatus = appStatus === 'draft' ? 'setup'
  : appStatus === 'active' ? 'in_progress'
  : 'completed';
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
| openai | 4.x | RAG embeddings (chat-bot) |
