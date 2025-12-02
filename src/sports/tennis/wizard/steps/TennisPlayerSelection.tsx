/**
 * Tennis Player Selection Step
 *
 * Add players to the tournament:
 * - Manual entry
 * - Minimum 2 players required
 */

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, User, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { useTennisWizardStore } from '../store';

export function TennisPlayerSelection() {
  const { players } = useTennisWizardStore(useShallow((s) => ({
    players: s.players,
  })));

  const addPlayer = useTennisWizardStore((s) => s.addPlayer);
  const removePlayer = useTennisWizardStore((s) => s.removePlayer);

  const [inputValue, setInputValue] = useState('');

  const handleAddPlayer = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      const id = uuidv4();
      const bgColors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'];
      const bg = bgColors[Math.floor(Math.random() * bgColors.length)];

      addPlayer({
        id,
        name: inputValue.trim(),
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(id)}&backgroundColor=${bg}`,
      });
      setInputValue('');
    }
  };

  const minPlayers = 2;
  const hasEnoughPlayers = players.length >= minPlayers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Ajouter les Joueurs</h2>
        <p className="text-slate-400">Minimum {minPlayers} joueurs pour commencer</p>
      </div>

      {/* Player Count Badge */}
      <div className="flex justify-center">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
          hasEnoughPlayers
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
        )}>
          <Users className="w-4 h-4" />
          {players.length} joueur{players.length !== 1 ? 's' : ''}
          {!hasEnoughPlayers && ` (${minPlayers - players.length} de plus requis)`}
        </div>
      </div>

      {/* Add Player Form */}
      <form onSubmit={handleAddPlayer} className="flex gap-3">
        <div className="flex-1 relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nom du joueur..."
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            autoFocus
          />
        </div>
        <Button
          type="submit"
          disabled={!inputValue.trim()}
          className="px-6 bg-emerald-600 hover:bg-emerald-500"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </form>

      {/* Player List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-3 bg-slate-800/50 border border-white/5 rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-6">{index + 1}.</span>
                <PlayerAvatar
                  src={player.avatar}
                  name={player.name}
                  className="w-8 h-8"
                  fallbackClassName="text-[10px]"
                />
                <span className="font-medium text-white">{player.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removePlayer(player.id)}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {players.length === 0 && (
          <div className="py-12 text-center border border-dashed border-slate-700 rounded-xl">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-500">Aucun joueur ajouté</p>
            <p className="text-xs text-slate-600 mt-1">Commencez par ajouter des joueurs ci-dessus</p>
          </div>
        )}
      </div>

      {/* Recommended Sizes Info */}
      {players.length > 0 && (
        <div className="text-center text-xs text-slate-500">
          Tailles recommandées: 4, 8, 16, 32 joueurs
          {[4, 8, 16, 32].includes(players.length) && (
            <span className="ml-2 text-emerald-400">Taille idéale</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
