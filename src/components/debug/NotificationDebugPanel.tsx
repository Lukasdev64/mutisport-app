import { useState } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/components/ui/toast';
import {
  Bug,
  Bell,
  BellRing,
  Send,
  CheckCircle,
  XCircle,
  Zap,
  Trophy,
  Play,
  Users
} from 'lucide-react';

interface NotificationDebugPanelProps {
  tournamentId?: string;
  tournamentName?: string;
  players?: Array<{ id: string; name: string }>;
}

/**
 * Debug panel for testing notification system
 * Only visible in development mode
 */
export function NotificationDebugPanel({
  tournamentId = 'test-tournament',
  tournamentName = 'Test Tournament',
  players = [
    { id: 'player-1', name: 'Alice' },
    { id: 'player-2', name: 'Bob' },
    { id: 'player-3', name: 'Charlie' },
    { id: 'player-4', name: 'Diana' }
  ]
}: NotificationDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlayer1, setSelectedPlayer1] = useState(players[0]?.id || '');
  const [selectedPlayer2, setSelectedPlayer2] = useState(players[1]?.id || '');
  const [selectedWinner, setSelectedWinner] = useState(players[0]?.id || '');
  const { toast } = useToast();
  const {
    isInitialized,
    isSupported,
    permission,
    activeSubscription,
    requestPermission,
    subscribeToTournament,
    unsubscribeFromTournament
  } = useNotifications();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';

  // Simulate match events
  const simulateMatchStart = () => {
    const player1 = getPlayerName(selectedPlayer1);
    const player2 = getPlayerName(selectedPlayer2);
    toast(`Match started: ${player1} vs ${player2}`, 'info');
    console.log('[Debug] Match start notification triggered', { player1, player2 });
  };

  const simulateMatchComplete = () => {
    const winner = getPlayerName(selectedWinner);
    toast(`Match completed! ${winner} wins`, 'success');
    console.log('[Debug] Match complete notification triggered', { winner });
  };

  const simulateTournamentUpdate = () => {
    toast(`${tournamentName}: Round 2 is starting!`, 'info');
    console.log('[Debug] Tournament update notification triggered');
  };

  const simulatePlayerCall = () => {
    const player1 = getPlayerName(selectedPlayer1);
    const player2 = getPlayerName(selectedPlayer2);
    toast(`Calling ${player1} and ${player2} to Court 1`, 'info');
    console.log('[Debug] Player call notification triggered');
  };

  const simulateTournamentWinner = () => {
    const winner = getPlayerName(selectedWinner);
    toast(`Tournament finished! ${winner} is the champion!`, 'success');
    console.log('[Debug] Tournament winner notification triggered');
  };

  // Test browser notification directly
  const testBrowserNotification = async () => {
    if (!('Notification' in window)) {
      toast('Browser notifications not supported', 'error');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from the debug panel',
        icon: '/icons/pwa-192x192.svg',
        tag: 'debug-test'
      });
      toast('Browser notification sent!', 'success');
    } else if (Notification.permission === 'denied') {
      toast('Notifications are blocked. Enable in browser settings.', 'error');
    } else {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        testBrowserNotification();
      } else {
        toast('Notification permission denied', 'error');
      }
    }
  };

  const testSubscription = async () => {
    try {
      await subscribeToTournament(tournamentId, 'spectator');
      console.log('[Debug] Subscribed to tournament:', tournamentId);
    } catch (error) {
      console.error('[Debug] Subscription failed:', error);
      toast('Subscription failed', 'error');
    }
  };

  const testUnsubscribe = async () => {
    try {
      await unsubscribeFromTournament();
      console.log('[Debug] Unsubscribed from tournament');
    } catch (error) {
      console.error('[Debug] Unsubscribe failed:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg"
        title="Debug Panel"
      >
        <Bug className="w-6 h-6" />
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Notification Debug
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Status Section */}
          <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm">
            <h4 className="font-semibold mb-2 text-gray-300">Status</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">OneSignal Init:</span>
                <span className={isInitialized ? 'text-green-400' : 'text-red-400'}>
                  {isInitialized ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Push Supported:</span>
                <span className={isSupported ? 'text-green-400' : 'text-red-400'}>
                  {isSupported ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Permission:</span>
                <span className={
                  permission === 'granted' ? 'text-green-400' :
                  permission === 'denied' ? 'text-red-400' : 'text-yellow-400'
                }>
                  {permission}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Subscribed:</span>
                <span className={activeSubscription ? 'text-green-400' : 'text-gray-400'}>
                  {activeSubscription ? `${activeSubscription.role}` : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Player Selection */}
          <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm">
            <h4 className="font-semibold mb-2 text-gray-300">Players</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">Player 1</label>
                <select
                  value={selectedPlayer1}
                  onChange={(e) => setSelectedPlayer1(e.target.value)}
                  className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Player 2</label>
                <select
                  value={selectedPlayer2}
                  onChange={(e) => setSelectedPlayer2(e.target.value)}
                  className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2">
              <label className="text-xs text-gray-400">Winner</label>
              <select
                value={selectedWinner}
                onChange={(e) => setSelectedWinner(e.target.value)}
                className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toast Notifications */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-gray-300 text-sm">Toast Notifications</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={simulateMatchStart}
                className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-xs"
              >
                <Play className="w-3 h-3" />
                Match Start
              </button>
              <button
                onClick={simulateMatchComplete}
                className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-xs"
              >
                <CheckCircle className="w-3 h-3" />
                Match End
              </button>
              <button
                onClick={simulatePlayerCall}
                className="flex items-center justify-center gap-1 bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-xs"
              >
                <Users className="w-3 h-3" />
                Player Call
              </button>
              <button
                onClick={simulateTournamentUpdate}
                className="flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-xs"
              >
                <Zap className="w-3 h-3" />
                Round Start
              </button>
              <button
                onClick={simulateTournamentWinner}
                className="col-span-2 flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded text-xs"
              >
                <Trophy className="w-3 h-3" />
                Tournament Winner
              </button>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-gray-300 text-sm">Push Notifications</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={requestPermission}
                className="flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded text-xs"
              >
                <Bell className="w-3 h-3" />
                Request Perm
              </button>
              <button
                onClick={testBrowserNotification}
                className="flex items-center justify-center gap-1 bg-pink-600 hover:bg-pink-700 px-3 py-2 rounded text-xs"
              >
                <BellRing className="w-3 h-3" />
                Test Browser
              </button>
              <button
                onClick={testSubscription}
                className="flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded text-xs"
                disabled={!!activeSubscription}
              >
                <Send className="w-3 h-3" />
                Subscribe
              </button>
              <button
                onClick={testUnsubscribe}
                className="flex items-center justify-center gap-1 bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-xs"
                disabled={!activeSubscription}
              >
                <XCircle className="w-3 h-3" />
                Unsubscribe
              </button>
            </div>
          </div>

          {/* Console Tip */}
          <p className="text-xs text-gray-500 text-center">
            Check browser console for detailed logs
          </p>
        </div>
      )}
    </div>
  );
}
