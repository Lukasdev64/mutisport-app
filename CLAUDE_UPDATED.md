# CLAUDE.md - Multi-Sport Platform

This file provides comprehensive guidance to Claude Code when working with this repository.

## Project Overview

**Multi-Sport Platform** is a modern React 19 + TypeScript + Vite application for managing sports tournaments and competitions. It's a sophisticated sports management system built with:

- **Frontend**: React 19, TypeScript, Vite (blazingly fast builds)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Package Manager**: Bun (fast JavaScript runtime)
- **Payment Processing**: Stripe integration for billing
- **State Management**: Zustand (with persistence), React Query
- **Styling**: Tailwind CSS v4 with Vite integration
- **UI/Motion**: Framer Motion, Lucide React icons

The platform currently supports **Tennis** and **Basketball** with comprehensive scoring engines, tournament formats, and real-time bracket management.

## Project Statistics

- **Total Lines of Code**: ~2,578 TypeScript/TSX files
- **Current Branch**: dev (main is production)
- **Git Status**: Multiple modified feature files (tournament, billing, tennis, settings)
- **Build Size**: Optimized with lazy loading and code splitting

## Development Commands

```bash
# Install dependencies (uses Bun)
bun install

# Start development server (http://localhost:5173)
bun run dev

# Build for production (TypeScript + Vite)
bun run build

# Preview production build
bun run preview

# Run linter
bun run lint

# Testing with Bun
bun test                    # Run tests
bun test:watch             # Watch mode
bun test:coverage          # Coverage report
```

## Environment Setup

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Configure Supabase credentials** in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Supabase Setup**:
   - Refer to `SUPABASE_SETUP.md` for database schema
   - Database schema includes: profiles, tournaments, matches, rounds, players, standings, subscriptions
   - Row-level security (RLS) policies configured for multi-tenant isolation
   - Realtime subscriptions for live tournament updates

## Architecture Overview

### Project Structure

```
src/
├── App.tsx                          # Main routing and provider setup
├── main.tsx                         # React entry point
├── index.css                        # Global Tailwind CSS
├── assets/                          # Images, fonts, static files
├── components/                      # Reusable UI components
│   ├── auth/                        # Auth-related components (AutoLogin)
│   ├── common/                      # Common utilities (ErrorBoundary, LoadingSpinner)
│   ├── layout/                      # Layout components (Layout wrapper)
│   ├── sport/                       # Sport-specific components
│   └── ui/                          # Base UI components (Button, Card, Dialog, Input, Toast)
├── features/                        # Feature modules (feature-based architecture)
│   ├── billing/                     # Billing/Stripe integration
│   ├── dashboard/                   # Main dashboard view
│   ├── landing/                     # Public landing page
│   ├── players/                     # Player management
│   ├── settings/                    # User settings
│   ├── teams/                       # Team management
│   └── tournament/                  # Tournament management (largest feature)
│       ├── components/              # Tournament UI components
│       │   ├── arena/               # Live match arena
│       │   ├── availability/        # Player availability
│       │   ├── invitation/          # Tournament invitations
│       │   ├── registration/        # Player registration
│       │   ├── scheduling/          # Match scheduling
│       │   └── wizard/              # Multi-step tournament creation
│       ├── logic/                   # Tournament business logic (engine, bracket generation)
│       ├── store/                   # Zustand stores (tournament, wizard state)
│       ├── TournamentArenaPage.tsx  # Live tournament page
│       ├── TournamentsPage.tsx      # Tournament listing
│       └── TournamentWizardPage.tsx # New tournament creation
├── hooks/                           # Custom React hooks
│   ├── useSportFilter.ts           # Sport filtering logic
│   ├── useStripe.ts                # Stripe integration hook
│   ├── useTeams.ts                 # Team management hook
│   └── useTournaments.ts           # Tournament fetching/management
├── lib/                             # Third-party integrations
│   ├── supabase.ts                 # Supabase client setup (with fallback)
│   ├── utils.ts                    # Utility functions (cn for Tailwind)
│   ├── mockData.ts                 # Mock tournaments for development
│   └── additionalMockData.ts       # Additional mock data
├── providers/                       # React context providers
│   └── ReactQueryProvider.tsx       # React Query/TanStack Query setup
├── context/                         # React contexts
│   └── SubscriptionContext.tsx      # Subscription/billing state
├── sports/                          # Sport-specific logic
│   ├── tennis/                      # Tennis implementation
│   │   ├── components/              # Tennis UI components (PresetCard)
│   │   ├── config.ts               # Tennis match configuration
│   │   ├── scoring.ts              # TennisScoringEngine class
│   │   ├── TennisMatchModal.tsx    # Tennis match scoring modal
│   │   └── tournamentPresets.ts    # Pre-configured tournament formats
│   └── basketball/                  # Basketball implementation
│       ├── BasketballMatchModal.tsx # Basketball scoring modal
│       └── scoring.ts              # Basketball scoring logic
├── store/                           # Global Zustand stores
│   └── sportStore.ts               # Active sport selection (persisted)
├── types/                           # TypeScript type definitions
│   ├── sport.ts                    # Sport types and SPORTS registry
│   ├── supabase.ts                 # Auto-generated Supabase types
│   ├── tennis.ts                   # Tennis types (config, scoring, stats)
│   ├── team.ts                     # Team types
│   └── tournament.ts               # Tournament types (comprehensive)
└── tests/                           # Unit tests
    ├── bracketGeneration.test.ts
    ├── matchService.test.ts
    ├── tennisScoring.test.ts
    └── useTournaments.test.tsx
```

### Key Architectural Patterns

#### 1. **Feature-Based Architecture**
- Code organized by feature (tournament, billing, teams, players)
- Each feature is mostly self-contained with its own components, logic, and stores
- Shared utilities and components centralized in `components/` and `lib/`
- Enables scaling and team separation

#### 2. **State Management**
- **Zustand** for persistent local state (sport selection, tournaments)
- **React Query** (TanStack Query) for server state (data fetching, caching)
- **React Context** for subscription/billing status
- **Automatic persistence** to localStorage via Zustand middleware

#### 3. **Provider Hierarchy**
```
ToastProvider
  └── SubscriptionProvider
      └── Router
          ├── AutoLogin
          └── Routes
              └── ReactQueryProvider
                  └── App Components
```

#### 4. **Component Patterns**

**Lazy Loading**:
```tsx
const TournamentWizardPage = lazy(() => 
  import('@/features/tournament/TournamentWizardPage')
    .then(module => ({ default: module.TournamentWizardPage }))
);

<Suspense fallback={<LoadingSpinner fullScreen />}>
  <TournamentWizardPage />
</Suspense>
```

**Zustand Stores with Persistence**:
```tsx
export const useSportStore = create<SportStore>()(
  persist(
    (set, get) => ({
      activeSport: 'tennis',
      setActiveSport: (sport) => set({ activeSport: sport }),
    }),
    { name: 'sport-storage' }
  )
);
```

#### 5. **Sports-Specific Implementation**

Each sport has:
- **Config**: TennisMatchConfig, specific rules and settings
- **Scoring Engine**: TennisScoringEngine static methods for point/game/set scoring
- **Match Modal**: UI for live scoring during matches
- **Tournament Presets**: Pre-configured tournament formats

Current Sports:
- **Tennis**: Best-of-3/5, deuce handling, tiebreaks, advantage system
- **Basketball**: Game scoring, possessions, timeouts

## Routing Structure

```
/                           → Landing page (public)
/dashboard                  → Dashboard (protected, sport-filtered)
/tournaments                → All tournaments list
/tournaments/new            → Tournament creation wizard (protected)
/tournaments/:id            → Tournament arena / live view (protected)
/players                    → Player management (protected)
/teams                      → Team management (protected)
/billing                    → Billing/subscription (protected)
/settings                   → User settings (protected)
```

**Route Protection**: Uses Layout wrapper with auth checks via AutoLogin component

## Tennis Implementation Deep Dive

### Scoring System

The `TennisScoringEngine` class provides comprehensive scoring:

```typescript
class TennisScoringEngine {
  static awardPoint(score, playerId, playerIds?): TennisMatchScore
  static awardGame(score, playerId, playerIds?): TennisMatchScore
  static awardSet(score, playerId, playerIds?): TennisMatchScore
  static updateTiebreakScore(score, playerId): TennisMatchScore
  static isMatchComplete(score): boolean
  static getDisplayScore(score): DisplayScore
}
```

### Match Configuration

```typescript
interface TennisMatchConfig {
  format: 'best_of_3' | 'best_of_5'
  surface: 'clay' | 'hard' | 'grass' | 'indoor'
  tiebreakAt: number                    // Usually 6 games
  finalSetTiebreak: boolean             // Some tournaments skip final set tiebreak
  decidingPointAtDeuce: boolean         // No-Ad scoring (sudden death)
  letRule: boolean                      // Service let rules
  coachingAllowed: boolean              // On-court coaching
  challengesPerSet?: number             // Hawk-Eye challenges
  warmupMinutes: number
  changeoverSeconds: number
  betweenPointsSeconds: number
}
```

### Tournament Presets

Pre-configured formats available in `tournamentPresets.ts`:
- Professional (ATP/WTA style)
- Amateur (recreational level)
- Youth (different rules for minors)

## Data Flow Patterns

### Tournament Creation Flow

1. **TournamentWizardPage** → Multi-step form
2. **WizardStore** (Zustand) → Manages form state
3. **FormatAndRules** → Configure tennis/sport-specific rules
4. **TournamentSetup** → Player list and bracket generation
5. **TournamentArenaPage** → Live tournament view

### Real-Time Updates

- **Supabase Realtime** for live score updates
- **React Query** handles caching and stale state
- **Zustand** persists tournament state locally
- **SubscriptionContext** tracks user billing status

### Error Handling

- **ErrorBoundary** component wraps app for catastrophic failures
- **Toast notifications** (via ToastProvider) for user feedback
- **Supabase fallback mode** when credentials missing
- **Type-safe error patterns** across services

## State Management Examples

### Sport Selection (Persistent)
```tsx
// Get active sport
const activeSport = useSportStore((state) => state.activeSport);

// Change sport
const { setActiveSport } = useSportStore();
setActiveSport('basketball');

// Persists to localStorage automatically
```

### Tournament Data (Server State)
```tsx
// Fetch with React Query
const { data: tournaments, isLoading } = useQuery({
  queryKey: ['tournaments'],
  queryFn: fetchTournaments,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Subscription Status (Context)
```tsx
const { isPro, planName, isLoading } = useSubscription();

// Updates in real-time via Supabase subscription channel
```

## Testing

**Test Files**:
- `tests/bracketGeneration.test.ts` - Bracket algorithm testing
- `tests/tennisScoring.test.ts` - Tennis scoring logic
- `tests/matchService.test.ts` - Match service operations
- `tests/useTournaments.test.tsx` - Hook testing

**Run Tests**:
```bash
bun test              # All tests
bun test:watch        # Watch mode for development
bun test:coverage     # Coverage report
```

## Linting & Formatting

**ESLint Configuration**:
- TypeScript support (typescript-eslint)
- React hooks rules
- React refresh support
- Runs on `**/*.{ts,tsx}`

```bash
bun run lint          # Check for issues
```

## Build Configuration

### Vite (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [
    react(),              // React Fast Refresh
    tailwindcss(),        // Tailwind CSS v4
  ],
  resolve: {
    alias: {
      '@': '/src',        // Path alias for imports
    },
  },
})
```

### TypeScript (`tsconfig.json`)
- Base URL and path mapping for `@/` imports
- Target: ES2020
- JSX: react-jsx
- Strict mode enabled

### Path Aliases
Use `@/` to import from src directory:
```tsx
import { Button } from '@/components/ui/button'
import { useTournamentStore } from '@/features/tournament/store/tournamentStore'
import type { Tournament } from '@/types/tournament'
```

## Environment Variables

**Required**:
```env
VITE_SUPABASE_URL=          # Supabase project URL
VITE_SUPABASE_ANON_KEY=     # Supabase anonymous key
```

**Optional**:
```env
VITE_APP_URL=               # For production deployment
```

Note: Supabase is checked and falls back to mock mode if credentials missing

## Stripe Integration

Located in `src/features/billing/`:
- Hook: `useStripe()` for subscription management
- Webhook handlers via Supabase Edge Functions
- Plans: Free (base) and Pro (premium features)
- SubscriptionContext manages plan state globally

## Common Development Tasks

### Add a New Sport

1. Create `src/sports/[sport-name]/` directory
2. Implement `config.ts` with sport rules
3. Implement `scoring.ts` with scoring engine
4. Create `[Sport]MatchModal.tsx` component
5. Add to `src/types/sport.ts` SPORTS registry
6. Create tournament presets

### Add a Tournament Feature

1. Create feature folder in `src/features/tournament/components/`
2. Create Zustand store in `src/features/tournament/store/` if needed
3. Add types to `src/types/tournament.ts`
4. Export from feature's index file
5. Import and use in wizard or arena page

### Add a UI Component

1. Create in `src/components/ui/`
2. Use Tailwind CSS classes
3. Export from components index
4. Use `cn()` utility for class merging:
   ```tsx
   import { cn } from '@/lib/utils'
   
   <button className={cn("px-4 py-2", isActive && "bg-blue-500")}>
   ```

### Debug Tournament State

```tsx
import { useTournamentStore } from '@/features/tournament/store/tournamentStore'

// In component
const { tournaments, activeTournamentId } = useTournamentStore()
console.log('Active Tournament:', tournaments.find(t => t.id === activeTournamentId))
```

## Performance Optimization

- **Lazy Loading**: Routes loaded on demand (Suspense + lazy)
- **Code Splitting**: Automatic with Vite
- **React Query Caching**: Configurable staleTime (default 5 min)
- **Zustand Persistence**: Minimal size with selective storage
- **Tailwind CSS**: Optimized with v4 Vite plugin
- **Bun Runtime**: ~3x faster than Node.js for dev/test

## Deployment

See `DEPLOYMENT.md` for:
- **Vercel**: Recommended (serverless)
- **Netlify**: Alternative option
- Build command: `bun run build`
- Environment variables setup per platform
- Testing after deployment checklist

## Important Notes

1. **Bun Runtime**: This project uses Bun for package management and testing. Install from https://bun.sh
2. **Supabase Required**: Features depend on Supabase. Mock mode activates automatically if credentials missing
3. **Mobile Responsive**: Tailwind CSS responsive classes used throughout
4. **TypeScript Strict**: Full type safety enabled - no `any` types encouraged
5. **Real-time**: Supabase channels used for live tournament updates
6. **Feature Branches**: Development happens on `dev` branch, `main` is production-ready
7. **Path Imports**: Always use `@/` alias instead of relative paths for better maintainability

## Debugging Tips

### Enable Verbose Logging
```typescript
// In supabase.ts
export const supabase = createClient(..., {
  // Add debug logging
})
```

### Tournament Store Debugging
```tsx
// Check persisted state
localStorage.getItem('tournament-storage')
localStorage.getItem('sport-storage')
```

### React Query DevTools
```tsx
// Install: bun add @tanstack/react-query-devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// In providers
<ReactQueryProvider>
  {children}
  <ReactQueryDevtools />
</ReactQueryProvider>
```

### Tennis Scoring Tests
```bash
bun test tests/tennisScoring.test.ts
```

## Dependencies Overview

### Key Libraries
- **react**: 19.2.0 - React framework
- **typescript**: ~5.9.3 - Type safety
- **vite**: 7.2.4 - Build tool (ultra-fast)
- **tailwindcss**: 4.1.17 - Styling
- **zustand**: 5.0.8 - State management
- **@tanstack/react-query**: 5.90.10 - Server state
- **@supabase/supabase-js**: 2.84.0 - Backend
- **framer-motion**: 12.23.24 - Animations
- **lucide-react**: 0.554.0 - Icons
- **@stripe/react-stripe-js**: 5.4.0 - Payments

### Dev Dependencies
- **bun**: Built-in test runner (no separate test framework)
- **happy-dom**: DOM simulation for tests
- **eslint**: 9.39.1 - Linting
- **typescript-eslint**: - TS linting

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Zustand**: https://github.com/pmndrs/zustand
- **Vite**: https://vitejs.dev
- **TypeScript**: https://www.typescriptlang.org
- **Bun**: https://bun.sh

## Contact & Support

For questions about this codebase or implementation details, refer to:
- Git commit messages for context
- Type definitions for data structures
- Test files for usage examples
- Feature branches for work in progress
