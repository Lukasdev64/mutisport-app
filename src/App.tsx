import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ToastProvider } from '@/components/ui/toast';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AutoLogin } from '@/components/auth/AutoLogin';

// Lazy load pages
const LandingPage = lazy(() => import('@/features/landing/LandingPage').then(module => ({ default: module.LandingPage })));
const PricingPage = lazy(() => import('@/features/landing/PricingPage').then(module => ({ default: module.PricingPage })));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const TournamentWizardPage = lazy(() => import('@/features/tournament/TournamentWizardPage').then(module => ({ default: module.TournamentWizardPage })));
const TournamentArenaPage = lazy(() => import('@/features/tournament/TournamentArenaPage').then(module => ({ default: module.TournamentArenaPage })));
const TournamentsPage = lazy(() => import('@/features/tournament/TournamentsPage').then(module => ({ default: module.TournamentsPage })));
const PlayersPage = lazy(() => import('@/features/players/PlayersPage').then(module => ({ default: module.PlayersPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then(module => ({ default: module.SettingsPage })));
const TeamManagement = lazy(() => import('@/features/teams/TeamManagement'));
const BillingPage = lazy(() => import('@/features/billing/BillingPage'));

function App() {
  return (
    <ToastProvider>
      <SubscriptionProvider>
        <Router>
          <AutoLogin />
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

            {/* App Routes - With Sidebar */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Suspense fallback={<LoadingSpinner fullScreen />}>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/tournaments/new" element={<TournamentWizardPage />} />
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
      </SubscriptionProvider>
    </ToastProvider>
  );
}

export default App;
