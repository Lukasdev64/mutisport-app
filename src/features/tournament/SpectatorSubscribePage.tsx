import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, BellOff, Trophy, Users, Calendar, ArrowRight, Loader2, AlertCircle, CheckCircle2, Smartphone, Download, Share } from 'lucide-react';
import { useTournament } from '@/hooks/useTournaments';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';

// Detect iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Detect if running as installed PWA
const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;
};

export function SpectatorSubscribePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isPWAInstalled, setIsPWAInstalled] = useState(isStandalone());
  const [isIOSDevice] = useState(isIOS());

  const { data: tournament, isLoading, error } = useTournament(id || '');

  const {
    permission,
    isSupported,
    activeSubscription,
    subscribeToTournament,
    unsubscribeFromTournament,
    deferredPrompt,
    installPWA
  } = useNotifications();

  // Check if PWA gets installed
  useEffect(() => {
    const checkStandalone = () => setIsPWAInstalled(isStandalone());
    window.addEventListener('appinstalled', checkStandalone);
    // Also check on visibility change (user might have installed and come back)
    document.addEventListener('visibilitychange', checkStandalone);
    return () => {
      window.removeEventListener('appinstalled', checkStandalone);
      document.removeEventListener('visibilitychange', checkStandalone);
    };
  }, []);

  // Update page title with tournament name (manifest is handled in index.html)
  useEffect(() => {
    if (!tournament) return;

    const originalTitle = document.title;
    document.title = `${tournament.name} - Tournoi en direct`;

    // Update iOS app title meta tag
    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    const originalAppleTitle = appleTitle?.getAttribute('content');
    if (appleTitle) {
      appleTitle.setAttribute('content', tournament.name);
    }

    return () => {
      document.title = originalTitle;
      if (appleTitle && originalAppleTitle) {
        appleTitle.setAttribute('content', originalAppleTitle);
      }
    };
  }, [tournament]);

  // Can we show install button? (Android/Desktop with prompt available)
  const canInstallPWA = !!deferredPrompt && !isPWAInstalled;

  const isSubscribed = activeSubscription?.tournamentId === id;

  const handleSubscribe = async () => {
    if (!id) return;

    setSubscribeStatus('loading');
    try {
      await subscribeToTournament(id, 'spectator');
      setSubscribeStatus('success');
    } catch (err) {
      console.error('Failed to subscribe:', err);
      setSubscribeStatus('error');
    }
  };

  const handleUnsubscribe = async () => {
    setSubscribeStatus('loading');
    try {
      await unsubscribeFromTournament();
      setSubscribeStatus('idle');
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
      setSubscribeStatus('error');
    }
  };

  const handleViewTournament = () => {
    navigate(`/tournaments/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-slate-900 flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm sm:text-base">Chargement du tournoi...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !tournament) {
    return (
      <div className="min-h-[100dvh] bg-slate-900 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white mb-2">Tournoi introuvable</h1>
          <p className="text-slate-400 text-sm sm:text-base mb-6">
            Ce tournoi n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-900 flex flex-col justify-center px-4 py-8 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Tournament Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 sm:p-6 border-b border-slate-700">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  {tournament.status === 'active' ? 'En cours' : tournament.status}
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-white mt-1 truncate">{tournament.name}</h1>
              </div>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{tournament.players.length} joueurs</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{new Date(tournament.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            {/* Notification Section */}
            <div className="pt-4 border-t border-slate-700">
              {(!isSupported || permission === 'unsupported') && !isPWAInstalled ? (
                // Need to install PWA first
                <div className="space-y-4">
                  {canInstallPWA ? (
                    // Android/Desktop - Show install button
                    <>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Download className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-white font-medium">Installer l'application</h3>
                        <p className="text-slate-400 text-sm mt-1">
                          Installez l'app pour recevoir les notifications en temps réel.
                        </p>
                      </div>
                      <Button
                        onClick={installPWA}
                        className="w-full bg-green-600 hover:bg-green-500 py-3"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Installer l'application
                      </Button>
                    </>
                  ) : isIOSDevice ? (
                    // iOS - Show manual instructions
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Share className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-white font-medium">Installer l'application</h3>
                        <p className="text-slate-400 text-sm mt-1">
                          Pour recevoir les notifications sur iPhone :
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-bold">1</div>
                          <p className="text-slate-300 text-sm">Appuyez sur <Share className="w-4 h-4 inline text-blue-400" /> en bas de Safari</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-bold">2</div>
                          <p className="text-slate-300 text-sm">Sélectionnez "Sur l'écran d'accueil"</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-bold">3</div>
                          <p className="text-slate-300 text-sm">Ouvrez l'app et revenez ici</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Fallback - generic unsupported message
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Smartphone className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="text-slate-300 font-medium text-sm">Notifications non disponibles</h3>
                          <p className="text-slate-500 text-xs mt-1">
                            Ouvrez ce lien dans Chrome ou Safari pour activer les notifications.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : permission === 'denied' ? (
                // Notifications blocked
                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <BellOff className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-amber-400 font-medium text-sm">Notifications bloquées</h3>
                      <p className="text-slate-400 text-xs mt-1">
                        Activez les notifications dans les paramètres de votre navigateur pour recevoir les mises à jour en direct.
                      </p>
                    </div>
                  </div>
                </div>
              ) : isSubscribed || subscribeStatus === 'success' ? (
                // Subscribed successfully
                <div className="space-y-4">
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-green-400 font-medium text-sm">Abonné aux notifications</h3>
                        <p className="text-slate-400 text-xs mt-1">
                          Vous recevrez les résultats des matchs en temps réel sur votre appareil.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={subscribeStatus === 'loading'}
                    className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-300 text-sm transition-colors"
                  >
                    {subscribeStatus === 'loading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                    Se désabonner
                  </button>
                </div>
              ) : (
                // Ready to subscribe
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-white font-medium">Suivre ce tournoi</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Recevez les résultats des matchs en temps réel directement sur votre téléphone.
                    </p>
                  </div>

                  <Button
                    onClick={handleSubscribe}
                    disabled={subscribeStatus === 'loading'}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-3"
                  >
                    {subscribeStatus === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Activation...
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        Activer les notifications
                      </>
                    )}
                  </Button>

                  {subscribeStatus === 'error' && (
                    <p className="text-red-400 text-xs text-center">
                      Une erreur est survenue. Veuillez réessayer.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer - View Tournament */}
          <div className="p-4 bg-slate-900/50 border-t border-slate-700">
            <Button
              onClick={handleViewTournament}
              variant="outline"
              className="w-full border-slate-600 hover:bg-slate-700"
            >
              Voir le tournoi en direct
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Skip link */}
        <p className="text-center mt-4">
          <button
            onClick={handleViewTournament}
            className="text-slate-500 hover:text-slate-400 text-sm underline transition-colors"
          >
            Continuer sans notifications
          </button>
        </p>
      </motion.div>
    </div>
  );
}
