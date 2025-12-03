import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateSetScore } from '../../validation';
import type { TennisSetScore } from '@/types/tennis';

interface SetScoreEditorProps {
  sets: TennisSetScore[];
  maxSets: number; // 3 pour best of 3, 5 pour best of 5
  onSetChange: (setIndex: number, p1Games: number, p2Games: number, tiebreak?: { player1: number; player2: number }) => void;
  onAddSet: (p1Games: number, p2Games: number, tiebreak?: { player1: number; player2: number }) => void;
  onRemoveSet: (setIndex: number) => void;
  player1Name?: string;
  player2Name?: string;
}

interface SetRowProps {
  setIndex: number;
  set: TennisSetScore;
  onChange: (p1Games: number, p2Games: number, tiebreak?: { player1: number; player2: number }) => void;
  onRemove: () => void;
  canRemove: boolean;
  player1Name?: string;
  player2Name?: string;
}

function SetRow({ setIndex, set, onChange, onRemove, canRemove, player1Name, player2Name }: SetRowProps) {
  const [p1Games, setP1Games] = useState(set.player1Games);
  const [p2Games, setP2Games] = useState(set.player2Games);
  const [tbP1, setTbP1] = useState(set.tiebreakScore?.player1 ?? 0);
  const [tbP2, setTbP2] = useState(set.tiebreakScore?.player2 ?? 0);

  // Sync avec les props quand elles changent
  useEffect(() => {
    setP1Games(set.player1Games);
    setP2Games(set.player2Games);
    setTbP1(set.tiebreakScore?.player1 ?? 0);
    setTbP2(set.tiebreakScore?.player2 ?? 0);
  }, [set]);

  // Détecter si on a besoin du tiebreak
  const needsTiebreak = p1Games === 7 && p2Games === 6 || p1Games === 6 && p2Games === 7;
  const tiebreak = needsTiebreak ? { player1: tbP1, player2: tbP2 } : undefined;

  // Validation
  const validation = validateSetScore(p1Games, p2Games, tiebreak);

  // Appliquer les changements
  const applyChanges = (newP1: number, newP2: number, newTbP1?: number, newTbP2?: number) => {
    const finalP1 = Math.max(0, Math.min(7, newP1));
    const finalP2 = Math.max(0, Math.min(7, newP2));
    const isTiebreak = (finalP1 === 7 && finalP2 === 6) || (finalP1 === 6 && finalP2 === 7);

    setP1Games(finalP1);
    setP2Games(finalP2);

    if (isTiebreak && newTbP1 !== undefined && newTbP2 !== undefined) {
      setTbP1(newTbP1);
      setTbP2(newTbP2);
      onChange(finalP1, finalP2, { player1: newTbP1, player2: newTbP2 });
    } else if (isTiebreak) {
      onChange(finalP1, finalP2, { player1: tbP1, player2: tbP2 });
    } else {
      onChange(finalP1, finalP2, undefined);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn(
        "p-4 rounded-xl border-2 transition-colors",
        validation.isValid
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-amber-500/30 bg-amber-500/5"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">Set {setIndex + 1}</span>
        <div className="flex items-center gap-2">
          {validation.isValid ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          )}
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Score inputs */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        {/* Player 1 */}
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-2 truncate">{player1Name || 'Joueur 1'}</div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyChanges(p1Games - 1, p2Games)}
              disabled={p1Games <= 0}
              className="h-12 w-12 rounded-full touch-target bg-slate-800 hover:bg-slate-700"
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="text-3xl font-bold text-white w-12 text-center">{p1Games}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyChanges(p1Games + 1, p2Games)}
              disabled={p1Games >= 7}
              className="h-12 w-12 rounded-full touch-target bg-slate-800 hover:bg-slate-700"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Separator */}
        <span className="text-2xl text-slate-600 font-bold">-</span>

        {/* Player 2 */}
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-2 truncate">{player2Name || 'Joueur 2'}</div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyChanges(p1Games, p2Games - 1)}
              disabled={p2Games <= 0}
              className="h-12 w-12 rounded-full touch-target bg-slate-800 hover:bg-slate-700"
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="text-3xl font-bold text-white w-12 text-center">{p2Games}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyChanges(p1Games, p2Games + 1)}
              disabled={p2Games >= 7}
              className="h-12 w-12 rounded-full touch-target bg-slate-800 hover:bg-slate-700"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tiebreak inputs (si 7-6 ou 6-7) */}
      {needsTiebreak && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-slate-700"
        >
          <div className="text-xs text-amber-400 text-center mb-3">Score du Tie-Break</div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
            {/* TB Player 1 */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyChanges(p1Games, p2Games, Math.max(0, tbP1 - 1), tbP2)}
                disabled={tbP1 <= 0}
                className="h-10 w-10 rounded-full touch-target bg-slate-800 hover:bg-slate-700"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-bold text-amber-400 w-10 text-center">{tbP1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyChanges(p1Games, p2Games, tbP1 + 1, tbP2)}
                className="h-10 w-10 rounded-full touch-target bg-slate-800 hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <span className="text-xl text-slate-600">-</span>

            {/* TB Player 2 */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyChanges(p1Games, p2Games, tbP1, Math.max(0, tbP2 - 1))}
                disabled={tbP2 <= 0}
                className="h-10 w-10 rounded-full touch-target bg-slate-800 hover:bg-slate-700"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-bold text-amber-400 w-10 text-center">{tbP2}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyChanges(p1Games, p2Games, tbP1, tbP2 + 1)}
                className="h-10 w-10 rounded-full touch-target bg-slate-800 hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error message */}
      {!validation.isValid && validation.error && (
        <div className="mt-3 text-xs text-amber-400 text-center">
          {validation.error}
        </div>
      )}
    </motion.div>
  );
}

export function SetScoreEditor({
  sets,
  maxSets,
  onSetChange,
  onAddSet,
  onRemoveSet,
  player1Name,
  player2Name
}: SetScoreEditorProps) {
  const canAddSet = sets.length < maxSets;

  const handleAddSet = () => {
    // Ajouter un set vide (6-0 par défaut pour qu'il soit valide)
    onAddSet(6, 0);
  };

  return (
    <div className="space-y-4">
      {/* Liste des sets */}
      <div className="space-y-3">
        {sets.map((set, index) => (
          <SetRow
            key={index}
            setIndex={index}
            set={set}
            onChange={(p1, p2, tb) => onSetChange(index, p1, p2, tb)}
            onRemove={() => onRemoveSet(index)}
            canRemove={sets.length > 1}
            player1Name={player1Name}
            player2Name={player2Name}
          />
        ))}
      </div>

      {/* Bouton ajouter set */}
      {canAddSet && (
        <Button
          variant="outline"
          onClick={handleAddSet}
          className="w-full py-6 border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un set
        </Button>
      )}
    </div>
  );
}
