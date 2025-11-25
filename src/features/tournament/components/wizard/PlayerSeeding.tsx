import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, Trophy, Shuffle, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { cn } from '@/lib/utils';
import type { Player } from '@/types/tournament';

interface PlayerSeedingProps {
  players: Player[];
  onReorder: (players: Player[]) => void;
}

interface SortablePlayerItemProps {
  player: Player;
  index: number;
}

/**
 * Individual sortable player item
 */
function SortablePlayerItem({ player, index }: SortablePlayerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  // Determine seed badge color
  const getSeedBadge = (seed: number) => {
    if (seed === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (seed === 2) return 'bg-slate-400/20 text-slate-300 border-slate-400/30';
    if (seed <= 4) return 'bg-amber-600/20 text-amber-500 border-amber-600/30';
    if (seed <= 8) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-slate-700/50 text-slate-400 border-slate-600/30';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-slate-800/50 border border-white/10 rounded-xl",
        "transition-shadow touch-target",
        isDragging && "shadow-lg shadow-blue-500/20 border-blue-500/50 z-50"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-2 -m-2 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing touch-action-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Seed Number */}
      <div className={cn(
        "w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm",
        getSeedBadge(index + 1)
      )}>
        {index + 1}
      </div>

      {/* Player Info */}
      <PlayerAvatar
        src={player.avatar}
        name={player.name}
        className="w-10 h-10"
        fallbackClassName="text-xs"
      />

      <div className="flex-1 min-w-0">
        <div className="font-medium text-white truncate">{player.name}</div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {player.ranking && (
            <span className="text-emerald-400">{player.ranking}</span>
          )}
          {player.age && <span>{player.age} ans</span>}
        </div>
      </div>

      {/* Top seed indicator */}
      {index < 4 && (
        <Trophy className={cn(
          "w-4 h-4",
          index === 0 ? "text-yellow-400" :
          index === 1 ? "text-slate-400" :
          index === 2 ? "text-amber-600" : "text-blue-400"
        )} />
      )}
    </div>
  );
}

/**
 * Component for managing player seeding via drag & drop
 */
export function PlayerSeeding({ players, onReorder }: PlayerSeedingProps) {
  const [localPlayers, setLocalPlayers] = useState(players);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8 // Minimum drag distance before activation
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  /**
   * Handle drag end - reorder players
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalPlayers((items) => {
        const oldIndex = items.findIndex(p => p.id === active.id);
        const newIndex = items.findIndex(p => p.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        onReorder(reordered);
        return reordered;
      });
    }
  }, [onReorder]);

  /**
   * Randomize seeding
   */
  const shufflePlayers = useCallback(() => {
    const shuffled = [...localPlayers].sort(() => Math.random() - 0.5);
    setLocalPlayers(shuffled);
    onReorder(shuffled);
  }, [localPlayers, onReorder]);

  /**
   * Sort by ranking (if available)
   */
  const sortByRanking = useCallback(() => {
    const sorted = [...localPlayers].sort((a, b) => {
      // Players with rankings come first
      if (a.ranking && !b.ranking) return -1;
      if (!a.ranking && b.ranking) return 1;
      if (!a.ranking && !b.ranking) return 0;

      // Simple string comparison for rankings (works for FFT rankings)
      return (a.ranking || '').localeCompare(b.ranking || '');
    });
    setLocalPlayers(sorted);
    onReorder(sorted);
  }, [localPlayers, onReorder]);

  // Sync with external changes
  if (players.length !== localPlayers.length ||
      players.some((p, i) => p.id !== localPlayers[i]?.id)) {
    setLocalPlayers(players);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-blue-400" />
            Seeding
          </h3>
          <p className="text-sm text-slate-400">
            Glissez les joueurs pour définir les têtes de série
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={sortByRanking}
            className="text-slate-400 hover:text-white"
          >
            <Trophy className="w-4 h-4 mr-1" />
            Par classement
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={shufflePlayers}
            className="text-slate-400 hover:text-white"
          >
            <Shuffle className="w-4 h-4 mr-1" />
            Aléatoire
          </Button>
        </div>
      </div>

      {/* Seeding Info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
      >
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold">1</div>
            <span className="text-slate-300">Tête de série #1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-400/20 border border-slate-400/30 flex items-center justify-center text-slate-300 font-bold">2</div>
            <span className="text-slate-300">Tête de série #2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-600/20 border border-amber-600/30 flex items-center justify-center text-amber-500 font-bold">3-4</div>
            <span className="text-slate-300">Quart de finale protégé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">5-8</div>
            <span className="text-slate-300">8ème de finale protégé</span>
          </div>
        </div>
      </motion.div>

      {/* Sortable List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localPlayers.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {localPlayers.map((player, index) => (
              <SortablePlayerItem
                key={player.id}
                player={player}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty state */}
      {localPlayers.length === 0 && (
        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
          <ArrowUpDown className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Aucun joueur à classer</p>
        </div>
      )}
    </div>
  );
}
