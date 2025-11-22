import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { TournamentWizardPage } from '@/features/tournament/TournamentWizardPage';
import { TournamentArenaPage } from '@/features/tournament/TournamentArenaPage';

import { TournamentsPage } from '@/features/tournament/TournamentsPage';
import { PlayersPage } from '@/features/players/PlayersPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

import { ToastProvider } from '@/components/ui/toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tournaments/new" element={<TournamentWizardPage />} />
            <Route path="/tournaments/:id" element={<TournamentArenaPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;
