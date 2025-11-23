import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ToastProvider } from '@/components/ui/toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Lazy load pages
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const TournamentWizardPage = lazy(() => import('@/features/tournament/TournamentWizardPage').then(module => ({ default: module.TournamentWizardPage })));
const TournamentArenaPage = lazy(() => import('@/features/tournament/TournamentArenaPage').then(module => ({ default: module.TournamentArenaPage })));
const TournamentsPage = lazy(() => import('@/features/tournament/TournamentsPage').then(module => ({ default: module.TournamentsPage })));
const PlayersPage = lazy(() => import('@/features/players/PlayersPage').then(module => ({ default: module.PlayersPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then(module => ({ default: module.SettingsPage })));

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tournaments/new" element={<TournamentWizardPage />} />
              <Route path="/tournaments/:id" element={<TournamentArenaPage />} />
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;
