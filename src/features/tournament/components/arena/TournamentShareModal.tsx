import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Download, QrCode, Check, Bell, BellOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNotifications } from '@/context/NotificationContext';
import type { Tournament } from '@/types/tournament';

interface TournamentShareModalProps {
  tournament: Tournament;
  isOpen: boolean;
  onClose: () => void;
}

export function TournamentShareModal({ tournament, isOpen, onClose }: TournamentShareModalProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const {
    permission,
    activeSubscription,
    subscribeToTournament,
    unsubscribeFromTournament
  } = useNotifications();

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const shareUrl = `${baseUrl}/tournaments/${tournament.id}`;
  const spectatorUrl = `${shareUrl}?subscribe=spectator`;

  const isSubscribed = activeSubscription?.tournamentId === tournament.id;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(spectatorUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tournament.name,
          text: `Follow the ${tournament.name} tournament live!`,
          url: spectatorUrl
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = `${tournament.name.replace(/\s+/g, '-')}-qr.png`;
      link.href = pngUrl;
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      await unsubscribeFromTournament();
    } else {
      await subscribeToTournament(tournament.id, 'spectator');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Share Tournament</h2>
                <p className="text-slate-400 text-sm">{tournament.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <div
              ref={qrRef}
              className="bg-white p-4 rounded-xl"
            >
              <QRCodeSVG
                value={spectatorUrl}
                size={180}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#1e293b"
              />
            </div>
            <p className="text-slate-400 text-xs mt-3 text-center">
              Scan to follow this tournament live
            </p>
          </div>

          {/* URL Display */}
          <div className="bg-slate-900/50 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="text-slate-300 text-sm truncate flex-1">
                {spectatorUrl}
              </span>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
            <button
              onClick={handleDownloadQR}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
          </div>

          {/* Notification Toggle */}
          <div className="border-t border-slate-700 pt-4">
            <button
              onClick={handleToggleSubscription}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors ${
                isSubscribed
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
              }`}
            >
              {isSubscribed ? (
                <>
                  <BellOff className="w-4 h-4" />
                  Unsubscribe from notifications
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Get match notifications
                </>
              )}
            </button>
            {permission === 'denied' && (
              <p className="text-amber-400 text-xs mt-2 text-center">
                Notifications blocked. Enable them in browser settings.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
