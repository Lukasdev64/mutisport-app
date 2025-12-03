import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SetScoreEditor } from './SetScoreEditor';
import { GameScoreEditor } from './GameScoreEditor';
import { useTennisScoreEditor } from '../../hooks/useTennisScoreEditor';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import type { TennisMatchScore, TennisMatchConfig } from '@/types/tennis';

type EditTab = 'sets' | 'games' | 'tiebreak';

interface TennisScoreEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  score: TennisMatchScore;
  config: TennisMatchConfig;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  onSave: (score: TennisMatchScore) => void;
  initialTab?: EditTab;
}

export function TennisScoreEditSheet({
  isOpen,
  onClose,
  score,
  config,
  player1Id,
  player2Id,
  player1Name,
  player2Name,
  onSave,
  initialTab = 'sets'
}: TennisScoreEditSheetProps) {
  const [activeTab, setActiveTab] = useState<EditTab>(initialTab);
  const dragControls = useDragControls();

  const maxSets = config.format === 'best_of_5' ? 5 : 3;

  const editor = useTennisScoreEditor({
    initialScore: score,
    config,
    player1Id,
    player2Id,
    onSave: (newScore) => {
      onSave(newScore);
      onClose();
    }
  });

  // Reset to initial tab when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      editor.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialTab]);

  // Prevent body scroll when open
  useBodyScrollLock(isOpen);

  const currentSet = editor.editingScore.sets[editor.editingScore.currentSet];
  const isTiebreak = currentSet?.isTiebreak;

  const handleSave = () => {
    if (editor.isValid) {
      editor.save();
    }
  };

  const tabs: { id: EditTab; label: string; disabled?: boolean }[] = [
    { id: 'sets', label: 'Sets' },
    { id: 'games', label: 'Jeux' },
    { id: 'tiebreak', label: 'Tie-Break', disabled: !isTiebreak }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Drag handle */}
            <div
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Éditer le Score</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={cn(
                    "flex-1 py-3 text-sm font-medium transition-colors relative",
                    activeTab === tab.id
                      ? "text-emerald-400"
                      : tab.disabled
                        ? "text-slate-600 cursor-not-allowed"
                        : "text-slate-400 hover:text-white"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 safe-area-bottom">
              <AnimatePresence mode="wait">
                {activeTab === 'sets' && (
                  <motion.div
                    key="sets"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <SetScoreEditor
                      sets={editor.editingScore.sets}
                      maxSets={maxSets}
                      onSetChange={editor.setSetScore}
                      onAddSet={editor.addSet}
                      onRemoveSet={editor.removeSet}
                      player1Name={player1Name}
                      player2Name={player2Name}
                    />
                  </motion.div>
                )}

                {activeTab === 'games' && (
                  <motion.div
                    key="games"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <GameScoreEditor
                      currentSet={currentSet}
                      setIndex={editor.editingScore.currentSet}
                      onGameChange={editor.setGameScore}
                      onAdjustGame={editor.adjustGame}
                      player1Name={player1Name}
                      player2Name={player2Name}
                    />
                  </motion.div>
                )}

                {activeTab === 'tiebreak' && isTiebreak && (
                  <motion.div
                    key="tiebreak"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white">Tie-Break</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Modifiez le score du tie-break
                      </p>
                    </div>

                    <div className="bg-amber-500/10 rounded-2xl p-6 border border-amber-500/20">
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        {/* P1 Tiebreak */}
                        <div className="text-center">
                          <div className="text-sm text-emerald-400 mb-2">{player1Name}</div>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editor.setTiebreakPoints(
                                Math.max(0, (currentSet.tiebreakScore?.player1 ?? 0) - 1),
                                currentSet.tiebreakScore?.player2 ?? 0
                              )}
                              className="h-12 w-12 rounded-full touch-target bg-slate-800"
                            >
                              -
                            </Button>
                            <span className="text-4xl font-bold text-amber-400 w-12 text-center">
                              {currentSet.tiebreakScore?.player1 ?? 0}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editor.setTiebreakPoints(
                                (currentSet.tiebreakScore?.player1 ?? 0) + 1,
                                currentSet.tiebreakScore?.player2 ?? 0
                              )}
                              className="h-12 w-12 rounded-full touch-target bg-slate-800"
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <span className="text-2xl text-slate-600">-</span>

                        {/* P2 Tiebreak */}
                        <div className="text-center">
                          <div className="text-sm text-blue-400 mb-2">{player2Name}</div>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editor.setTiebreakPoints(
                                currentSet.tiebreakScore?.player1 ?? 0,
                                Math.max(0, (currentSet.tiebreakScore?.player2 ?? 0) - 1)
                              )}
                              className="h-12 w-12 rounded-full touch-target bg-slate-800"
                            >
                              -
                            </Button>
                            <span className="text-4xl font-bold text-amber-400 w-12 text-center">
                              {currentSet.tiebreakScore?.player2 ?? 0}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editor.setTiebreakPoints(
                                currentSet.tiebreakScore?.player1 ?? 0,
                                (currentSet.tiebreakScore?.player2 ?? 0) + 1
                              )}
                              className="h-12 w-12 rounded-full touch-target bg-slate-800"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 text-center">
                      Le tie-break est gagné à 7 points avec 2 points d'écart
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Validation errors */}
              {editor.validationErrors.length > 0 && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div className="text-sm text-red-400">
                      {editor.validationErrors.map((error, i) => (
                        <div key={i}>{error}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 p-4 border-t border-slate-800 bg-slate-900/95 safe-area-bottom">
              <Button
                variant="ghost"
                onClick={editor.reset}
                disabled={!editor.hasChanges}
                className="flex-1 py-6 touch-target"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>

              <Button
                onClick={handleSave}
                disabled={!editor.isValid || !editor.hasChanges}
                className={cn(
                  "flex-1 py-6 touch-target",
                  editor.isValid && editor.hasChanges
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-slate-700 text-slate-400"
                )}
              >
                <Check className="w-4 h-4 mr-2" />
                Appliquer
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
