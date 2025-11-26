# Audit UX: Création de Tournois de Tennis

Analyse comparative de l'implémentation actuelle vs les meilleures pratiques du marché (Challonge, Tennis Tournament Planner, ITF Standards).

---

## Executive Summary

| Catégorie | Score Actuel | Objectif | Priorité |
|-----------|--------------|----------|----------|
| Wizard Flow | ⭐⭐⭐ 3/5 | 5/5 | 🔴 Haute |
| Configuration Tennis | ⭐⭐⭐⭐ 4/5 | 5/5 | 🟡 Moyenne |
| Score Entry | ⭐⭐ 2/5 | 5/5 | 🔴 Haute |
| Mobile Experience | ⭐⭐⭐ 3/5 | 5/5 | 🔴 Haute |
| Real-time Updates | ⭐⭐ 2/5 | 5/5 | 🟡 Moyenne |
| Player Management | ⭐⭐⭐ 3/5 | 5/5 | 🟡 Moyenne |

**Verdict Global**: L'application a une base solide avec les presets tennis et la génération de brackets, mais manque de fluidité dans le parcours utilisateur et d'options de scoring en temps réel.

---

## 1. Wizard Flow - Analyse

### État Actuel ✅

```
Mode Instant (4 étapes):
1. ModeSelection      → Choix instant/planned
2. FormatAndRules     → Preset + format tournoi
3. PlayerSelection    → Ajout joueurs
4. TournamentSummary  → Lancement
```

### Problèmes Identifiés 🔴

| Problème | Impact | Source |
|----------|--------|--------|
| **Trop d'étapes pour "instant"** | Friction | 4 étapes pour un mode "rapide" est contradictoire |
| **Pas de progression visuelle claire** | Confusion | Challonge montre clairement où l'utilisateur se situe |
| **Validation tardive** | Frustration | L'utilisateur découvre les erreurs à la fin |
| **Pas de sauvegarde brouillon** | Perte de données | Si l'utilisateur quitte, tout est perdu |
| **Step 2 (FormatAndRules) surchargé** | Overwhelm | Preset tennis + format tournoi + catégorie d'âge + classement en une seule page |

### Best Practices (Challonge, Tournify) 📚

1. **Création en 2-3 clics maximum** pour le mode rapide
2. **Progressive disclosure** - révéler les options au fur et à mesure
3. **Inline validation** - feedback immédiat sur chaque champ
4. **Auto-save** - sauvegarde automatique du brouillon
5. **Smart defaults** - pré-remplir intelligemment basé sur l'historique

### Recommandations 💡

#### R1.1: Mode "Quick Start" en 1 écran
```
┌─────────────────────────────────────────────────────────┐
│  🎾 Nouveau Tournoi Tennis                              │
├─────────────────────────────────────────────────────────┤
│  Preset: [Roland Garros ▼]                              │
│  Format: [● Élimination Simple  ○ Poules  ○ Swiss]      │
│  Joueurs: [8 ▼]                                         │
│                                                         │
│  [+ Ajouter joueur]  [📋 Importer liste]                │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 1. Alice    2. Bob    3. Carol    4. David         ││
│  │ 5. Eve      6. Frank  7. Grace    8. _____         ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  [🚀 Lancer le Tournoi]                                 │
└─────────────────────────────────────────────────────────┘
```

**Implémentation**: Fusionner steps 2-3 en mode instant

#### R1.2: Progress Stepper Interactif
```tsx
// Actuel: Barre de progression simple
<div className="h-2 bg-slate-800 rounded-full">
  <div style={{ width: `${(step / totalSteps) * 100}%` }} />
</div>

// Recommandé: Stepper avec labels cliquables
<Stepper activeStep={step} onStepClick={setStep}>
  <Step label="Mode" completed={step > 1} />
  <Step label="Règles" completed={!!tennisConfig} />
  <Step label="Joueurs" completed={players.length >= 4} />
  <Step label="Lancer" />
</Stepper>
```

#### R1.3: Validation en Temps Réel
```tsx
// Ajouter dans FormatAndRules.tsx
const validationErrors = useMemo(() => {
  const errors: string[] = [];
  if (!tennisConfig) errors.push("Sélectionnez un preset tennis");
  if (!format) errors.push("Choisissez un format de tournoi");
  if (format === 'round_robin' && estimatedMaxParticipants > 12) {
    errors.push("Round Robin limité à 12 joueurs");
  }
  return errors;
}, [tennisConfig, format, estimatedMaxParticipants]);

// Afficher en temps réel sous les champs
{validationErrors.length > 0 && (
  <Alert variant="warning">
    {validationErrors.map(e => <p key={e}>⚠️ {e}</p>)}
  </Alert>
)}
```

---

## 2. Configuration Tennis - Analyse

### État Actuel ✅

**Points forts:**
- 13 presets officiels complets
- TennisRulesCustomizer avec toutes les options
- Configuration sauvegardée avec le tournoi

### Problèmes Identifiés 🔴

| Problème | Impact |
|----------|--------|
| **Presets non triés par popularité** | Les Grand Chelem en premier, mais ATP 250 avant WTA 1000 |
| **Pas de recherche/filtre texte** | Difficile de trouver un preset spécifique |
| **Customizer peu intuitif** | 6 sections collapsibles = cognitive load |
| **Pas de preview visuelle** | L'utilisateur ne voit pas l'impact des règles |
| **Pas de "Mes presets favoris"** | Reconfiguration manuelle à chaque fois |

### Best Practices 📚

1. **"Most Popular" en premier** - Presets les plus utilisés en haut
2. **Recherche fuzzy** - "rg" trouve "Roland Garros"
3. **Preview visuelle** - Montrer à quoi ressemblera le scoring
4. **Favoris persistants** - localStorage pour les presets favoris
5. **Comparaison de presets** - Vue side-by-side

### Recommandations 💡

#### R2.1: Presets avec Favoris et Recherche
```tsx
// Ajouter dans TennisPresetSelector.tsx
const [favorites, setFavorites] = useLocalStorage<string[]>('tennis-preset-favorites', []);
const [search, setSearch] = useState('');

const filteredPresets = useMemo(() => {
  let presets = TENNIS_TOURNAMENT_PRESETS;

  // Filtrer par recherche
  if (search) {
    const query = search.toLowerCase();
    presets = presets.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  // Favoris en premier
  return [...presets].sort((a, b) => {
    const aFav = favorites.includes(a.id) ? -1 : 0;
    const bFav = favorites.includes(b.id) ? -1 : 0;
    return aFav - bFav;
  });
}, [search, favorites]);
```

#### R2.2: Preview du Scoring
```tsx
// Nouveau composant: TennisScorePreview.tsx
function TennisScorePreview({ config }: { config: TennisMatchConfig }) {
  return (
    <div className="bg-slate-900 rounded-lg p-4">
      <div className="text-center text-sm text-slate-400 mb-2">
        Aperçu du match
      </div>
      <div className="flex justify-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold">J. Dupont</div>
          <div className="text-4xl font-mono mt-2">
            {config.format === 'best_of_5' ? '2' : '1'}
          </div>
          <div className="text-sm text-slate-400">sets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">M. Martin</div>
          <div className="text-4xl font-mono mt-2">1</div>
          <div className="text-sm text-slate-400">sets</div>
        </div>
      </div>
      <div className="text-center text-xs text-slate-500 mt-4">
        6-4, 3-6, {config.finalSetTiebreak ? '7-6(5)' : '7-5'}
      </div>
    </div>
  );
}
```

#### R2.3: Raccourcis Clavier pour Customizer
```tsx
// Ajouter les raccourcis pour power users
useHotkeys('1', () => setConfig({ ...config, format: 'best_of_3' }));
useHotkeys('2', () => setConfig({ ...config, format: 'best_of_5' }));
useHotkeys('c', () => setConfig({ ...config, surface: 'clay' }));
useHotkeys('h', () => setConfig({ ...config, surface: 'hard' }));
useHotkeys('g', () => setConfig({ ...config, surface: 'grass' }));
```

---

## 3. Score Entry - Analyse

### État Actuel ⚠️

**TennisMatchModal.tsx** offre uniquement:
- Sélection du vainqueur (bouton)
- Saisie optionnelle des scores de sets

**Manque critique**: Pas de Live Scoring point par point

### Problèmes Identifiés 🔴

| Problème | Impact | Sévérité |
|----------|--------|----------|
| **Pas de scoring en temps réel** | Expérience incomplète | 🔴 Critique |
| **Interface non optimisée tactile** | Difficile sur mobile | 🔴 Critique |
| **Pas de validation tennis** | Scores invalides possibles | 🟡 Modéré |
| **Pas d'undo** | Erreurs irrécupérables | 🟡 Modéré |
| **Pas de statistiques** | Données perdues | 🟢 Mineur |

### Best Practices (ITF, ATP) 📚

1. **Larges zones tactiles** - Boutons 48x48px minimum
2. **Score entry en 1-2 taps** depuis l'écran match
3. **Confirmation visuelle** avec animation
4. **Undo button** visible pendant 5 secondes
5. **Mode offline** avec sync ultérieure
6. **Sound feedback** optionnel

### Recommandations 💡

#### R3.1: Interface de Scoring Live
```tsx
// Nouveau composant: TennisLiveScoring.tsx
function TennisLiveScoring({ match, onScoreUpdate }) {
  const [score, setScore] = useState<TennisMatchScore>(
    match.score || TennisScoringEngine.initializeMatch(match.config)
  );
  const [history, setHistory] = useState<TennisMatchScore[]>([]);

  const handlePoint = (player: 1 | 2) => {
    setHistory(prev => [...prev, score]);

    const currentSet = score.sets[score.currentSet];
    const newScore = currentSet.isTiebreak
      ? TennisScoringEngine.awardTiebreakPoint(score, player)
      : TennisScoringEngine.awardPoint(score, player);

    setScore(newScore);
    onScoreUpdate(newScore);

    // Haptic feedback sur mobile
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      setScore(history[history.length - 1]);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const gameScore = TennisScoringEngine.getGameScoreDisplay(score.currentGame);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col">
      {/* Header avec score sets */}
      <div className="p-4 bg-slate-900">
        <div className="text-center text-2xl font-mono">
          {TennisScoringEngine.getScoreDisplay(score)}
        </div>
      </div>

      {/* Score du jeu en cours - GRAND */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-8">
          <button
            onClick={() => handlePoint(1)}
            className="w-40 h-40 rounded-2xl bg-blue-600 hover:bg-blue-500
                       active:scale-95 transition-transform flex flex-col
                       items-center justify-center touch-manipulation"
          >
            <span className="text-lg opacity-70">{match.player1.name}</span>
            <span className="text-6xl font-bold">{gameScore.p1}</span>
          </button>

          <button
            onClick={() => handlePoint(2)}
            className="w-40 h-40 rounded-2xl bg-red-600 hover:bg-red-500
                       active:scale-95 transition-transform flex flex-col
                       items-center justify-center touch-manipulation"
          >
            <span className="text-lg opacity-70">{match.player2.name}</span>
            <span className="text-6xl font-bold">{gameScore.p2}</span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex justify-between">
        <button
          onClick={handleUndo}
          disabled={history.length === 0}
          className="px-6 py-3 bg-slate-800 rounded-lg disabled:opacity-30"
        >
          ↩️ Annuler
        </button>

        <button className="px-6 py-3 bg-emerald-600 rounded-lg">
          ✓ Terminer le match
        </button>
      </div>
    </div>
  );
}
```

#### R3.2: Validation des Scores de Sets
```tsx
// Améliorer isValidSetScore dans TennisMatchModal
function isValidTennisSetScore(p1: number, p2: number, config: TennisMatchConfig): ValidationResult {
  const tiebreakAt = config.tiebreakAt;

  // Victoire normale: 6-0 à 6-4 (ou config.tiebreakAt)
  if ((p1 === tiebreakAt && p2 <= tiebreakAt - 2) ||
      (p2 === tiebreakAt && p1 <= tiebreakAt - 2)) {
    return { valid: true };
  }

  // Victoire avec 2 jeux d'écart: 7-5
  if ((p1 === tiebreakAt + 1 && p2 === tiebreakAt - 1) ||
      (p2 === tiebreakAt + 1 && p1 === tiebreakAt - 1)) {
    return { valid: true };
  }

  // Tie-break: 7-6 ou 6-7
  if ((p1 === tiebreakAt + 1 && p2 === tiebreakAt) ||
      (p2 === tiebreakAt + 1 && p1 === tiebreakAt)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: `Score invalide. Exemples valides: 6-4, 7-5, 7-6`
  };
}
```

#### R3.3: Mode Offline avec Sync
```tsx
// Service Worker pour offline
// src/services/offlineScoring.ts
const PENDING_SCORES_KEY = 'pending-match-scores';

export function savePendingScore(matchId: string, score: TennisMatchScore) {
  const pending = JSON.parse(localStorage.getItem(PENDING_SCORES_KEY) || '[]');
  pending.push({ matchId, score, timestamp: Date.now() });
  localStorage.setItem(PENDING_SCORES_KEY, JSON.stringify(pending));
}

export async function syncPendingScores() {
  const pending = JSON.parse(localStorage.getItem(PENDING_SCORES_KEY) || '[]');

  for (const item of pending) {
    try {
      await supabase.from('tournament_matches')
        .update({ score: item.score })
        .eq('id', item.matchId);
    } catch (e) {
      console.error('Sync failed for', item.matchId);
      continue; // Retry later
    }
  }

  localStorage.removeItem(PENDING_SCORES_KEY);
}
```

---

## 4. Mobile Experience - Analyse

### État Actuel ⚠️

- Layout responsive basique
- Pas d'optimisation tactile spécifique
- Wizard scroll long sur mobile

### Problèmes Identifiés 🔴

| Problème | Impact |
|----------|--------|
| **Touch targets trop petits** | Misclicks fréquents |
| **Pas de gestes** | UX non native |
| **Clavier numérique non forcé** | Saisie score difficile |
| **Pas de pull-to-refresh** | Refresh manuel requis |

### Recommandations 💡

#### R4.1: Touch Targets 48px Minimum
```css
/* Ajouter dans les composants critiques */
.touch-target {
  min-height: 48px;
  min-width: 48px;
  padding: 12px;
}

/* Pour les boutons de score */
.score-button {
  min-height: 64px;
  font-size: 24px;
  touch-action: manipulation; /* Évite le zoom au double-tap */
}
```

#### R4.2: Clavier Numérique pour Scores
```tsx
<input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="0"
  className="text-center text-2xl w-16"
/>
```

#### R4.3: Gestes de Navigation
```tsx
// Utiliser react-swipeable pour le wizard
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => canProceed() && nextStep(),
  onSwipedRight: () => step > 1 && prevStep(),
  trackMouse: false
});

return <div {...handlers}>{children}</div>;
```

---

## 5. Real-time Updates - Analyse

### État Actuel ⚠️

- Supabase Realtime configuré (10 events/sec)
- Utilisé uniquement pour `SubscriptionContext`
- Pas de live updates pour les tournois

### Recommandations 💡

#### R5.1: Subscription aux Matchs Live
```tsx
// hooks/useLiveMatch.ts
export function useLiveMatch(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchMatch(matchId).then(setMatch);

    // Realtime subscription
    const channel = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tournament_matches',
        filter: `id=eq.${matchId}`
      }, (payload) => {
        setMatch(payload.new as Match);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  return match;
}
```

#### R5.2: Toast Notifications pour les Résultats
```tsx
// Dans BracketDisplay ou TournamentArenaPage
useEffect(() => {
  const channel = supabase
    .channel('tournament-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'tournament_matches',
      filter: `tournament_id=eq.${tournamentId}`
    }, (payload) => {
      if (payload.new.status === 'completed') {
        toast.success(`Match terminé: ${getMatchSummary(payload.new)}`);
      }
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [tournamentId]);
```

---

## 6. Player Management - Analyse

### État Actuel ⚠️

- Ajout manuel de joueurs (nom uniquement)
- Avatars générés automatiquement
- Pas d'import bulk
- Pas de lien avec profils existants

### Recommandations 💡

#### R6.1: Import CSV/Excel
```tsx
// components/PlayerImport.tsx
function PlayerImport({ onImport }) {
  const handleFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');

    const players = lines
      .filter(line => line.trim())
      .map((line, index) => {
        const [name, email, ranking] = line.split(',').map(s => s.trim());
        return {
          id: uuidv4(),
          name,
          email,
          ranking,
          seed: index + 1
        };
      });

    onImport(players);
  };

  return (
    <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
      <input
        type="file"
        accept=".csv,.txt"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        id="player-import"
      />
      <label htmlFor="player-import" className="cursor-pointer">
        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-slate-300">Importer une liste (CSV)</p>
        <p className="text-xs text-slate-500 mt-1">Format: Nom, Email, Classement</p>
      </label>
    </div>
  );
}
```

#### R6.2: Seeding Drag & Drop
```tsx
// Utiliser @dnd-kit pour le reordering
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function PlayerSeeding({ players, onReorder }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = players.findIndex(p => p.id === active.id);
      const newIndex = players.findIndex(p => p.id === over.id);
      onReorder(arrayMove(players, oldIndex, newIndex));
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={players} strategy={verticalListSortingStrategy}>
        {players.map((player, index) => (
          <SortablePlayer key={player.id} player={player} seed={index + 1} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

---

## 7. Roadmap des Améliorations

### Phase 1 - Quick Wins (1-2 semaines)

| Tâche | Fichier | Effort |
|-------|---------|--------|
| Touch targets 48px | Tous les boutons | 2h |
| Validation inline FormatAndRules | `FormatAndRules.tsx` | 4h |
| Clavier numérique scores | `TennisMatchModal.tsx` | 1h |
| Favoris presets (localStorage) | `TennisPresetSelector.tsx` | 3h |
| Recherche presets | `TennisPresetSelector.tsx` | 2h |

### Phase 2 - Core UX (2-4 semaines)

| Tâche | Fichier | Effort |
|-------|---------|--------|
| Live Scoring interface | Nouveau composant | 16h |
| Mode Quick Start 1 écran | `TournamentWizardPage.tsx` | 8h |
| Import joueurs CSV | `PlayerSelection.tsx` | 4h |
| Drag & Drop seeding | `PlayerSelection.tsx` | 6h |
| Undo pour scoring | `TennisLiveScoring.tsx` | 4h |

### Phase 3 - Advanced (1-2 mois)

| Tâche | Fichier | Effort |
|-------|---------|--------|
| Realtime match updates | Hooks + Supabase | 12h |
| Mode offline + sync | Service Worker | 16h |
| Statistiques de match | Nouveau module | 20h |
| PWA complète | Config Vite | 8h |
| Notifications push | Supabase + FCM | 12h |

---

## 8. Métriques de Succès

### KPIs à Tracker

| Métrique | Actuel (estimé) | Objectif |
|----------|-----------------|----------|
| Temps création tournoi (instant) | ~3 min | < 1 min |
| Taux d'abandon wizard | ~40% | < 15% |
| Clics pour saisir un score | 5-6 | 2-3 |
| Temps de chargement pages | ~2s | < 1s |
| Usage mobile vs desktop | 30/70 | 60/40 |

### Instrumentation Recommandée
```tsx
// Ajouter tracking avec web-vitals (déjà installé)
import { onCLS, onFID, onLCP } from 'web-vitals';

// Tracker les événements clés
analytics.track('tournament_created', {
  mode: 'instant',
  sport: 'tennis',
  preset: 'roland-garros',
  format: 'single_elimination',
  playerCount: 8,
  timeToCreate: 45 // seconds
});
```

---

## Conclusion

L'application a une **excellente base technique** (presets tennis complets, scoring engine robuste, architecture Zustand/React Query moderne). Les améliorations prioritaires sont:

1. **🔴 Live Scoring** - Expérience point par point indispensable
2. **🔴 Quick Start Mode** - Réduire la friction de création
3. **🔴 Mobile Optimization** - Touch targets + gestes
4. **🟡 Real-time Updates** - Exploiter Supabase Realtime
5. **🟡 Player Import** - CSV + drag & drop seeding

Ces améliorations transformeront l'application d'un "bon outil" en une **expérience fluide et professionnelle** comparable à Challonge ou Tennis Tournament Planner.
