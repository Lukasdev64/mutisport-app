import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode
} from 'react';
import {
  initOneSignal,
  promptForNotifications,
  subscribeTournament,
  unsubscribeTournament,
  isPushSupported,
  getNotificationPermission,
  setExternalUserId,
  logoutOneSignal
} from '@/lib/onesignal';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';

type PermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';
type SubscriptionRole = 'player' | 'spectator' | 'organizer';

interface ActiveSubscription {
  tournamentId: string;
  role: SubscriptionRole;
  playerId?: string;
}

interface NotificationContextType {
  isInitialized: boolean;
  isSupported: boolean;
  permission: PermissionStatus;
  activeSubscription: ActiveSubscription | null;
  requestPermission: () => Promise<boolean>;
  subscribeToTournament: (tournamentId: string, role: SubscriptionRole, playerId?: string) => Promise<void>;
  unsubscribeFromTournament: () => Promise<void>;
  showInstallPrompt: boolean;
  dismissInstallPrompt: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
  installPWA: () => Promise<void>;
}

// BeforeInstallPromptEvent type for TypeScript
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<PermissionStatus>('default');
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  // Initialize OneSignal and check permissions
  useEffect(() => {
    const init = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (!supported) {
        setPermission('unsupported');
        setIsInitialized(true);
        return;
      }

      const initialized = await initOneSignal();
      setIsInitialized(initialized);

      if (initialized) {
        const currentPermission = await getNotificationPermission();
        setPermission(currentPermission);

        // Link OneSignal with Supabase user
        if (isSupabaseConfigured()) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await setExternalUserId(user.id);
          }
        }
      }
    };

    init();

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Only show prompt if not already in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured() || !isInitialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await setExternalUserId(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          await logoutOneSignal();
          setActiveSubscription(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isInitialized]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isInitialized || !isSupported) {
      toast('Push notifications are not supported on this device', 'error');
      return false;
    }

    const granted = await promptForNotifications();
    setPermission(granted ? 'granted' : 'denied');

    if (granted) {
      toast('Notifications enabled! You will receive match updates.', 'success');
    } else {
      toast('Notifications blocked. You can enable them in browser settings.', 'info');
    }

    return granted;
  }, [isInitialized, isSupported, toast]);

  const subscribeToTournamentFn = useCallback(async (
    tournamentId: string,
    role: SubscriptionRole,
    playerId?: string
  ): Promise<void> => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    await subscribeTournament(tournamentId, role, playerId);
    setActiveSubscription({ tournamentId, role, playerId });
    toast(`Subscribed to tournament notifications as ${role}`, 'success');
  }, [permission, requestPermission, toast]);

  const unsubscribeFromTournamentFn = useCallback(async (): Promise<void> => {
    await unsubscribeTournament();
    setActiveSubscription(null);
    toast('Unsubscribed from tournament notifications', 'info');
  }, [toast]);

  const dismissInstallPrompt = useCallback(() => {
    setShowInstallPrompt(false);
  }, []);

  const installPWA = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast('App installed successfully!', 'success');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, toast]);

  const value: NotificationContextType = {
    isInitialized,
    isSupported,
    permission,
    activeSubscription,
    requestPermission,
    subscribeToTournament: subscribeToTournamentFn,
    unsubscribeFromTournament: unsubscribeFromTournamentFn,
    showInstallPrompt,
    dismissInstallPrompt,
    deferredPrompt,
    installPWA
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
