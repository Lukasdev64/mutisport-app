/**
 * Lazy Loaded Routes
 * Code-split routes for better performance
 *
 * Usage in App.jsx:
 * import { LazyDashboard, LazyTournamentView } from './routes/lazyRoutes'
 *
 * <Route path="/dashboard" element={<LazyDashboard />} />
 */

import { lazyLoadPage, lazyLoadWithRetry } from '../utils/lazyLoad'

// Dashboard & Main Pages (high priority)
export const LazyDashboard = lazyLoadPage(() => import('../pages/Dashboard'))
export const LazyLogin = lazyLoadPage(() => import('../pages/Login'))
export const LazyRegister = lazyLoadPage(() => import('../pages/Register'))

// Settings & Profile (low priority)
export const LazySettings = lazyLoadPage(() =>
  import('../pages/Settings')
)

export const LazyProfile = lazyLoadPage(() =>
  import('../pages/Profile')
)

// Heavy Components (lazy load within pages)
export const LazyDoubleEliminationBracket = lazyLoadWithRetry(() =>
  import('../components/tournament/organisms/brackets/DoubleEliminationBracket')
)

export const LazySwissBracket = lazyLoadWithRetry(() =>
  import('../components/tournament/organisms/brackets/SwissBracket')
)

export const LazyRoundRobinBracket = lazyLoadWithRetry(() =>
  import('../components/tournament/organisms/brackets/RoundRobinBracket')
)

// Export utilities for programmatic loading
export const preloadDashboard = () => import('../pages/Dashboard')
