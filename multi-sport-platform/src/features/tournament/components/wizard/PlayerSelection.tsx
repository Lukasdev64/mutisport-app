import { useState } from 'react';
import { useWizardStore } from '../../store/wizardStore';
import { Button } from '@/components/ui/button';
import { Plus, X, User, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_PLAYERS } from '@/lib/mockData';
import { isPlayerEligible, AGE_CATEGORIES } from '@/config/categories';
import { isRankingEligible } from '@/config/rankings';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';

export function PlayerSelection() {
  const { 
    players, addPlayer, addExistingPlayer, removePlayer, 
    ageCategory, isRanked, rankingRange 
  } = useWizardStore();
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      addPlayer(inputValue);
      setInputValue('');
    }
  };

  const handleAddExisting = (player: typeof MOCK_PLAYERS[0]) => {
    // Check if already added
    if (players.find(p => p.id === player.id)) return;
    
    addExistingPlayer(player);
  };

  // Filter available players
  const availablePlayers = MOCK_PLAYERS.filter(p => {
    // Filter out already added players (by name for now as IDs might differ)
    const isAdded = players.some(added => added.name === p.name);
    if (isAdded) return false;

    // Filter by age category
    let isAgeEligible = true;
    if (ageCategory === 'custom') {
      const { min, max } = useWizardStore.getState().customAgeRules;
      if (p.age === undefined) isAgeEligible = true;
      else if (min && p.age < min) isAgeEligible = false;
      else if (max && p.age > max) isAgeEligible = false;
    } else {
      isAgeEligible = isPlayerEligible(p.age, ageCategory);
    }
    if (!isAgeEligible) return false;

    // Filter by ranking
    if (isRanked) {
      if (!isRankingEligible(p.ranking, rankingRange.min, rankingRange.max)) {
        return false;
      }
    }

    return true;
  });

  const currentCategory = ageCategory === 'custom' 
    ? { name: 'Custom Rules' } 
    : AGE_CATEGORIES.find(c => c.id === ageCategory);

  return (
    <div className="space-y-8">
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-slate-300">Add Players</label>
          <form onSubmit={handleAdd} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter player name..."
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              autoFocus
              enterKeyHint="done"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          </form>
        </div>
        <Button 
          onClick={() => handleAdd()}
          disabled={!inputValue.trim()}
          className="h-[50px] px-6 bg-blue-600 hover:bg-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add
        </Button>
      </div>

      {/* Available Players from Database */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-400">
          Available Players ({currentCategory?.name})
        </h3>
        <div className="flex flex-wrap gap-2">
          {availablePlayers.length > 0 ? (
            availablePlayers.map(player => (
              <button
                key={player.id}
                onClick={() => handleAddExisting(player)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700 border border-white/5 rounded-full transition-colors group"
              >
                <PlayerAvatar 
                  src={player.avatar} 
                  name={player.name} 
                  className="w-5 h-5" 
                  fallbackClassName="text-[8px]"
                />
                <span className="text-sm text-slate-300">{player.name}</span>
                {player.age && <span className="text-xs text-slate-500">({player.age})</span>}
                {player.ranking && <span className="text-xs text-emerald-500 font-medium">[{player.ranking}]</span>}
                <Plus className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">No eligible players found for this category.</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Participants ({players.length})</span>
          {players.length < 2 && (
            <span className="text-amber-500">Minimum 2 players required</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {players.map((player) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-between p-3 bg-slate-800/50 border border-white/5 rounded-lg group hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <PlayerAvatar 
                    src={player.avatar} 
                    name={player.name} 
                    className="w-8 h-8" 
                    fallbackClassName="text-[10px]"
                  />
                  <span className="font-medium text-slate-200">{player.name}</span>
                </div>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {players.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-xl text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No players added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
