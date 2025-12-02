import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from 'sonner';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { SportPluginsProvider } from '@/sports/core/SportPluginsProvider';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AutoLogin } from '@/components/auth/AutoLogin';
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt';

// Lazy load pages
const LandingPage = lazy(() => import('@/features/landing/LandingPage').then(module => ({ default: module.LandingPage })));
const PricingPage = lazy(() => import('@/features/landing/PricingPage').then(module => ({ default: module.PricingPage })));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const TournamentArenaPage = lazy(() => import('@/features/tournament/TournamentArenaPage').then(module => ({ default: module.TournamentArenaPage })));
const TournamentsPage = lazy(() => import('@/features/tournament/TournamentsPage').then(module => ({ default: module.TournamentsPage })));
const PlayersPage = lazy(() => import('@/features/players/PlayersPage').then(module => ({ default: module.PlayersPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then(module => ({ default: module.SettingsPage })));
const TeamManagement = lazy(() => import('@/features/teams/TeamManagement'));
const BillingPage = lazy(() => import('@/features/billing/BillingPage'));

// Sport Selection Hub & Sport-Specific Wizards
const SportSelectionHub = lazy(() => import('@/features/tournament/components/wizard-hub/SportSelectionHub').then(module => ({ default: module.SportSelectionHub })));
const TennisWizardPage = lazy(() => import('@/sports/tennis/wizard/TennisWizardPage').then(module => ({ default: module.TennisWizardPage })));
const BasketballWizardPage = lazy(() => import('@/sports/basketball/wizard/BasketballWizardPage').then(module => ({ default: module.BasketballWizardPage })));

// Public Spectator Page (no sidebar)
const SpectatorSubscribePage = lazy(() => import('@/features/tournament/SpectatorSubscribePage').then(module => ({ default: module.SpectatorSubscribePage })));

function App() {
  return (
    <ToastProvider>
      <Toaster position="top-right" richColors theme="dark" />
      <SportPluginsProvider>
        <SubscriptionProvider>
          <NotificationProvider>
            <Router>
            <AutoLogin />
            <PWAInstallPrompt />
          <Routes>
            {/* Public Route - Landing Page */}
            <Route 
              path="/" 
              element={
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <LandingPage />
                </Suspense>
              } 
            />

            <Route
              path="/pricing"
              element={
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PricingPage />
                </Suspense>
              }
            />

            {/* Public Spectator Page - No Sidebar */}
            <Route
              path="/tournaments/:id/spectator"
              element={
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <SpectatorSubscribePage />
                </Suspense>
              }
            />

            {/* App Routes - With Sidebar */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Suspense fallback={<LoadingSpinner fullScreen />}>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      {/* Sport Selection Hub - Entry point for tournament creation */}
                      <Route path="/tournaments/new" element={<SportSelectionHub />} />
                      {/* Sport-Specific Wizards */}
                      <Route path="/tournaments/new/tennis" element={<TennisWizardPage />} />
                      <Route path="/tournaments/new/basketball" element={<BasketballWizardPage />} />
                      <Route path="/tournaments/:id" element={<TournamentArenaPage />} />
                      <Route path="/tournaments" element={<TournamentsPage />} />
                      <Route path="/players" element={<PlayersPage />} />
                      <Route path="/teams" element={<TeamManagement />} />
                      <Route path="/billing" element={<BillingPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </Suspense>
                </Layout>
              }
            />
            </Routes>
            </Router>
          </NotificationProvider>
        </SubscriptionProvider>
      </SportPluginsProvider>
    </ToastProvider>
  );
}

export default App;
