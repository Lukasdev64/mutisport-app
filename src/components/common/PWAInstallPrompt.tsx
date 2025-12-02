import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export function PWAInstallPrompt() {
  const { showInstallPrompt, dismissInstallPrompt, installPWA, deferredPrompt } = useNotifications();

  // Don't render if no install prompt available
  if (!showInstallPrompt || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-green-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">
                Install Multi-Sport
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Add to your home screen for quick access and push notifications
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={installPWA}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install
                </button>
                <button
                  onClick={dismissInstallPrompt}
                  className="px-3 py-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>

            <button
              onClick={dismissInstallPrompt}
              className="flex-shrink-0 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * iOS Install Instructions - shown when PWA install is not available
 * but user is on iOS Safari
 */
export function IOSInstallInstructions({ onClose }: { onClose: () => void }) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  if (!isIOS || !isSafari) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-slate-800 rounded-t-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-semibold text-lg mb-4">
          Install Multi-Sport on iOS
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold">
              1
            </div>
            <p className="text-slate-300 text-sm">
              Tap the <span className="font-semibold">Share</span> button at the bottom of Safari
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold">
              2
            </div>
            <p className="text-slate-300 text-sm">
              Scroll down and tap <span className="font-semibold">"Add to Home Screen"</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold">
              3
            </div>
            <p className="text-slate-300 text-sm">
              Tap <span className="font-semibold">"Add"</span> to install the app
            </p>
          </div>
        </div>

        <p className="text-slate-500 text-xs mt-4">
          This enables push notifications and offline access
        </p>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}
