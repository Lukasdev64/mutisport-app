import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTournamentStore } from './store/tournamentStore';
import { useTournament, useSyncTournamentToCloud } from '@/hooks/useTournaments';
import { BracketDisplay } from './components/arena/BracketDisplay';
import { ArenaSidebar } from './components/arena/ArenaSidebar';
import { Trophy, Users, Calendar, Share2, Bell, BellOff, Wifi, Loader2, CloudOff, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TournamentSettingsModal, type TabId } from './components/arena/TournamentSettingsModal';
import { TournamentShareModal } from './components/arena/TournamentShareModal';
import { TournamentStateIndicator } from './components/arena/TournamentStateIndicator';
import { TournamentWinnerModal } from './components/arena/TournamentWinnerModal';
import { useMatchSubscription } from '@/hooks/useMatchSubscription';
import { useTournamentNotifications, useConnectionStatus } from './hooks/useTournamentNotifications';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationDebugPanel } from '@/components/debug/NotificationDebugPanel';

export function TournamentArenaPage() {
  const { id } = useParams<{ id: string }>();

  // First try local store (for organizer/offline)
  const localTournament = useTournamentStore((state) =>
    state.tournaments.find((t) => t.id === id)
  );

  // If not in local store, fetch from Supabase (for spectators)
  const { data: remoteTournament, isLoading, error: fetchError } = useTournament(id || '');

  // Use local first, fallback to remote
  const tournament = localTournament || remoteTournament;

  // Auto-sync local tournament to Supabase if it's local-only
  const syncMutation = useSyncTournamentToCloud();

  useEffect(() => {
    // Only auto-sync if:
    // 1. We have a local tournament
    // 2. Not already synced (syncStatus !== 'synced')
    // 3. Not currently syncing
    // 4. Supabase query finished (not loading)
    // 5. Remote doesn't exist yet
    const shouldSync = localTournament
      && localTournament.syncStatus !== 'synced'
      && !syncMutation.isPending
      && !isLoading
      && !remoteTournament;

    if (shouldSync) {
      syncMutation.mutate(localTournament);
    }
  }, [localTournament?.id, localTournament?.syncStatus, remoteTournament, isLoading, syncMutation.isPending]);

  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<TabId>('general');
  const [showShare, setShowShare] = useState(false);

  const openSettingsWithTab = (tab: TabId) => {
    setSettingsTab(tab);
    setShowSettings(true);
  };

  // Real-time match subscription
  const { isConnected, lastUpdate, error } = useMatchSubscription({
    tournamentId: id || '',
    enabled: !!id
  });

  // Tournament notifications
  const { isSubscribed } = useTournamentNotifications({
    tournament: tournament ?? undefined,
    lastUpdate
  });

  // Notification context for subscribe/unsubscribe
  const { subscribeToTournament, unsubscribeFromTournament } = useNotifications();

  // Connection status for badge
  const connectionStatus = useConnectionStatus(isConnected, error);

  const handleToggleNotifications = async () => {
    if (!tournament) return;
    if (isSubscribed) {
      await unsubscribeFromTournament();
    } else {
      await subscribeToTournament(tournament.id, 'spectator');
    }
  };

  // Determine sync status for UI
  const getSyncStatusDisplay = () => {
    if (syncMutation.isPending) return { text: 'Synchronisation...', color: 'bg-yellow-500', icon: Cloud };
    if (tournament?.syncStatus === 'synced') return { text: 'Synchronisé', color: 'bg-green-500', icon: Cloud };
    if (tournament?.syncStatus === 'local-only') return { text: 'Local uniquement', color: 'bg-orange-500', icon: CloudOff };
    if (tournament?.syncStatus === 'pending') return { text: 'En attente', color: 'bg-yellow-500', icon: Cloud };
    return null; // Remote tournament - no sync status needed
  };

  const syncStatusDisplay = getSyncStatusDisplay();

  // Loading state (only show if not found locally and still fetching from Supabase)
  if (!localTournament && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Loader2 className="w-12 h-12 mb-4 animate-spin text-blue-500" />
        <h2 className="text-lg font-semibold">Loading Tournament...</h2>
        <p className="text-sm">Fetching tournament data</p>
      </div>
    );
  }

  // Syncing state
  if (syncMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Loader2 className="w-12 h-12 mb-4 animate-spin text-green-500" />
        <h2 className="text-lg font-semibold">Synchronisation en cours...</h2>
        <p className="text-sm">Upload du tournoi vers le cloud</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Trophy className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold">Tournament Not Found</h2>
        <p>The tournament you are looking for does not exist.</p>
        {fetchError && (
          <p className="text-xs text-red-400 mt-2">Error: {fetchError.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-4">
      {/* Header & Stats */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                {tournament.status}
              </span>
              {/* Sync status indicator */}
              {syncStatusDisplay && (
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${
                  syncStatusDisplay.color === 'bg-green-500' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  syncStatusDisplay.color === 'bg-orange-500' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  <syncStatusDisplay.icon className="w-3 h-3" />
                  <span>{syncStatusDisplay.text}</span>
                </span>
              )}
              {/* Live indicator */}
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 border border-slate-700">
                <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus.color} ${connectionStatus.pulse ? 'animate-pulse' : ''}`} />
                <Wifi className="w-3 h-3 text-slate-400" />
                <span className="text-slate-300">{connectionStatus.text}</span>
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(tournament.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">{tournament.name}</h1>
          </div>

          {/* Stats - Inline */}
          <div className="h-10 w-px bg-white/10 mx-2" />
          
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Players</p>
              <p className="text-sm font-bold text-white leading-none">{tournament.players.length}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Notification toggle */}
          <Button
            size="sm"
            variant="outline"
            className={`border-white/10 hover:bg-white/5 h-9 ${isSubscribed ? 'text-green-400 border-green-500/30' : ''}`}
            onClick={handleToggleNotifications}
          >
            {isSubscribed ? (
              <>
                <BellOff className="w-3 h-3 mr-2" />
                Subscribed
              </>
            ) : (
              <>
                <Bell className="w-3 h-3 mr-2" />
                Notify
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5 h-9" onClick={() => setShowShare(true)}>
            <Share2 className="w-3 h-3 mr-2" />
            Share
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-9" onClick={() => setShowSettings(true)}>
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content Area - Fixed Height Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Bracket (Takes up 3/4 space) */}
        <div className="lg:col-span-3 glass-panel rounded-xl border-white/10 overflow-hidden relative flex flex-col">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

          {/* State Indicator Banner */}
          <div className="relative z-10 p-4 pb-0">
            <TournamentStateIndicator
              tournament={tournament}
              onOpenScheduling={() => openSettingsWithTab('scheduling')}
            />
          </div>

          <div className="absolute inset-0 top-16 overflow-auto custom-scrollbar p-4">
            <BracketDisplay tournament={tournament} />
          </div>
        </div>

        {/* Right Column - Tabbed Sidebar */}
        <div className="lg:col-span-1 self-start">
          <ArenaSidebar tournament={tournament} />
        </div>
      </div>

      {/* Settings Modal */}
      <TournamentSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        tournament={tournament}
        initialTab={settingsTab}
      />

      {/* Share Modal */}
      <TournamentShareModal
        tournament={tournament}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />

      {/* Winner Celebration Modal */}
      <TournamentWinnerModal
        tournament={tournament}
        onClose={() => {
          // Optional: Add logic to prevent it from showing again immediately if desired
        }}
      />

      {/* Debug Panel (dev only) */}
      <NotificationDebugPanel
        tournamentId={tournament.id}
        tournamentName={tournament.name}
        players={tournament.players.map(p => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
