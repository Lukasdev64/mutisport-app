# Guide Complet: Création de Tournois de Tennis

Ce document décrit l'implémentation actuelle du système de création de tournois de tennis dans l'application Multi-Sport Platform.

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Types et Interfaces](#types-et-interfaces)
3. [Configuration Tennis](#configuration-tennis)
4. [Presets Officiels](#presets-officiels)
5. [Flux du Wizard](#flux-du-wizard)
6. [Génération de Bracket](#génération-de-bracket)
7. [Moteur de Scoring](#moteur-de-scoring)
8. [Affichage en Arena](#affichage-en-arena)

---

## Vue d'Ensemble

Le système de création de tournois de tennis permet de configurer des règles complètes basées sur les standards officiels (ATP, WTA, Grand Chelem). L'architecture repose sur:

- **Zustand Stores** pour la gestion d'état (wizard + tournament)
- **13 Presets Officiels** couvrant tous les formats professionnels
- **TennisScoringEngine** pour la logique de scoring
- **TournamentEngine** pour la génération de brackets

### Fichiers Clés

```
src/
├── types/tennis.ts                    # Types TypeScript
├── sports/tennis/
│   ├── config.ts                      # Configuration par défaut
│   ├── tournamentPresets.ts           # 13 presets officiels
│   └── scoring.ts                     # Moteur de scoring
├── features/tournament/
│   ├── store/wizardStore.ts           # État du wizard
│   ├── store/tournamentStore.ts       # Persistance tournois
│   ├── logic/engine.ts                # Génération brackets
│   └── components/
│       ├── wizard/
│       │   ├── FormatAndRules.tsx     # Étape config tennis
│       │   ├── TennisPresetSelector.tsx
│       │   ├── TennisRulesCustomizer.tsx
│       │   └── WizardLayout.tsx       # Orchestration
│       └── arena/
│           └── TennisRulesModule.tsx  # Affichage règles
```

---

## Types et Interfaces

### TennisMatchConfig

Configuration complète d'un match de tennis (`src/types/tennis.ts`):

```typescript
interface TennisMatchConfig {
  // Format de match
  format: 'best_of_3' | 'best_of_5';
  surface: 'clay' | 'hard' | 'grass' | 'indoor';

  // Règles de tie-break
  tiebreakAt: number;              // Généralement 6 (jeux)
  finalSetTiebreak: boolean;       // Tie-break au set décisif?
  finalSetTiebreakPoints?: number; // 7 (standard) ou 10 (super)

  // Variations de scoring
  decidingPointAtDeuce: boolean;   // No-Ad (point décisif à 40-40)

  // Règles de service
  letRule: boolean;                // false = No-Let

  // Règles de match
  coachingAllowed: boolean;
  challengesPerSet?: number;       // Hawk-Eye (généralement 3)

  // Temps réglementaires (en secondes/minutes)
  warmupMinutes: number;           // Échauffement
  changeoverSeconds: number;       // Changement de côté
  betweenPointsSeconds: number;    // Entre les points (shot clock)
}
```

### TennisMatchScore

État complet du score d'un match:

```typescript
interface TennisMatchScore {
  player1Sets: number;
  player2Sets: number;
  sets: TennisSetScore[];
  currentSet: number;              // Index 0-based
  currentGame: TennisGameScore;
  isComplete: boolean;
  winnerId?: string;
}

interface TennisSetScore {
  player1Games: number;
  player2Games: number;
  isTiebreak: boolean;
  tiebreakScore?: {
    player1: number;
    player2: number;
  };
}

interface TennisGameScore {
  player1Points: number;           // 0, 1, 2, 3 = 0, 15, 30, 40
  player2Points: number;
  isDeuce: boolean;
  advantage?: 1 | 2;
}
```

---

## Configuration Tennis

### Configuration par Défaut

Définie dans `src/sports/tennis/config.ts`:

```typescript
const DEFAULT_TENNIS_CONFIG: TennisMatchConfig = {
  format: 'best_of_3',
  surface: 'hard',
  tiebreakAt: 6,
  finalSetTiebreak: true,
  finalSetTiebreakPoints: 10,      // Super tie-break
  decidingPointAtDeuce: false,     // Avantage classique
  letRule: true,
  coachingAllowed: false,
  challengesPerSet: 3,
  warmupMinutes: 5,
  changeoverSeconds: 90,
  betweenPointsSeconds: 25
};
```

### Métadonnées UI

```typescript
const TENNIS_CONFIG = {
  surfaces: [
    { id: 'clay', name: 'Clay', color: 'orange', emoji: '🟧' },
    { id: 'hard', name: 'Hard Court', color: 'blue', emoji: '🔵' },
    { id: 'grass', name: 'Grass', color: 'green', emoji: '🟢' },
    { id: 'indoor', name: 'Indoor', color: 'slate', emoji: '⚪' }
  ],
  formats: [
    { id: 'best_of_3', name: 'Best of 3 Sets', description: 'First to win 2 sets' },
    { id: 'best_of_5', name: 'Best of 5 Sets', description: 'First to win 3 sets' }
  ]
};
```

---

## Presets Officiels

13 presets définis dans `src/sports/tennis/tournamentPresets.ts`:

### Grand Chelem (4)

| Preset | Surface | Format | Tie-break Set Décisif |
|--------|---------|--------|----------------------|
| Australian Open 🇦🇺 | Hard | 5 sets | Super tie-break (10 pts) |
| Roland Garros 🇫🇷 | Clay | 5 sets | **Aucun** (2 jeux d'écart) |
| Wimbledon 🇬🇧 | Grass | 5 sets | Standard (7 pts) |
| US Open 🇺🇸 | Hard | 5 sets | Standard (7 pts) |

### ATP Tour (4)

| Preset | Format | Particularités |
|--------|--------|----------------|
| ATP Masters 1000 | 3 sets | Super tie-break en 3ème |
| ATP 500 | 3 sets | Super tie-break en 3ème |
| ATP 250 | 3 sets | Super tie-break en 3ème |
| Next Gen ATP Finals ⚡ | 3 sets | **No-Ad + No-Let + Tie-break à 3-3** |

### WTA Tour (2)

| Preset | Format | Particularités |
|--------|--------|----------------|
| WTA 1000 | 3 sets | Super tie-break en 3ème |
| WTA 500 | 3 sets | Super tie-break en 3ème |

### Compétitions par Équipes (2)

| Preset | Format | Particularités |
|--------|--------|----------------|
| Davis Cup 🏅 | 3 sets | Super tie-break en 3ème |
| Laver Cup 🌍 | 3 sets | **No-Let**, changements 60s |

### Junior (1)

| Preset | Format | Particularités |
|--------|--------|----------------|
| Junior Grand Slam 🌟 | 3 sets | Échauffement 3 min |

### Custom (1)

Permet une configuration entièrement personnalisée via `TennisRulesCustomizer`.

### Helpers

```typescript
// Obtenir un preset par ID
getPresetById('roland-garros'): TournamentPreset | undefined

// Filtrer par catégorie
getPresetsByCategory('grand_slam'): TournamentPreset[]

// Labels de catégorie
getCategoryLabel('atp'): 'ATP Tour'
```

---

## Flux du Wizard

### Modes Disponibles

| Mode | Étapes | Description |
|------|--------|-------------|
| **Instant** | 4 | Création rapide, joueurs ajoutés manuellement |
| **Planned** | 6 | Avec setup détaillé et campagne d'inscription |

### Étapes Mode Instant (Tennis)

```
1. ModeSelection        → Choix instant/planned
2. FormatAndRules       → Preset tennis + format tournoi
3. PlayerSelection      → Ajout des joueurs
4. TournamentSummary    → Récap + lancement
```

### Étapes Mode Planned (Tennis)

```
1. ModeSelection        → Choix instant/planned
2. TournamentSetup      → Nom, sport, date, lieu
3. FormatAndRules       → Preset tennis + format tournoi
4. CampaignSetup        → Critères inscription
5. SchedulePreview      → (Placeholder)
6. TournamentSummary    → Récap + lancement
```

### État du Wizard (`wizardStore.ts`)

```typescript
interface WizardState {
  // Navigation
  step: number;
  totalSteps: number;            // 4 (instant) ou 6 (planned)
  mode: 'instant' | 'planned';

  // Setup (planned only)
  tournamentName: string;
  sport: 'tennis' | 'football' | 'basketball' | 'other';
  startDate: Date;
  venue: string;

  // Format & Rules
  format: TournamentFormat | null;
  estimatedMaxParticipants: number;

  // Tennis-specific
  tennisPresetId?: string;
  tennisConfig?: TennisMatchConfig;

  // Players
  players: Player[];
  selectedPlayers: Player[];
}
```

### Validation pour Progression

Dans `WizardLayout.tsx`, la validation pour les tournois tennis:

```typescript
// Step 2 (instant) ou Step 3 (planned): Format & Rules
if (sport === 'tennis') {
  return !!tennisConfig && !!format;  // Les deux requis!
}
return !!format;
```

### Création du Tournoi

```typescript
// WizardLayout.handleCreateTournament()
const newTournament: Tournament = {
  id: uuidv4(),
  name: finalName,
  format: format,
  sport: 'tennis',
  tennisConfig: tennisConfig,     // Sauvegardé!
  status: 'active',
  players: finalPlayers,
  rounds: TournamentEngine.generateBracket(finalPlayers, format),
  settings: {
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0
  }
};
```

---

## Génération de Bracket

### Formats Supportés

| Format | Classe | Méthode |
|--------|--------|---------|
| Single Elimination | `TournamentEngine` | `generateSingleElimination()` |
| Round Robin | `TournamentEngine` | `generateRoundRobin()` |
| Swiss | `TournamentEngine` | `generateSwiss()` / `generateSwissRound()` |
| Double Elimination | TODO | Non implémenté |

### Single Elimination

1. Calcul de la taille du bracket (puissance de 2)
2. Placement aléatoire des joueurs
3. Génération des "byes" pour les places vides
4. Création des rounds vides pour les phases suivantes
5. Liaison des matchs (`nextMatchId`)

```typescript
// Exemple: 6 joueurs → bracket de 8
// Round 1: 4 matchs (2 avec byes automatiques)
// Round 2: 2 matchs (demi-finales)
// Round 3: 1 match (finale)
```

### Round Robin

1. Rotation circulaire des joueurs
2. N-1 rounds pour N joueurs
3. Chaque joueur affronte tous les autres une fois

### Swiss

1. **Round 1**: Appariement aléatoire
2. **Rounds suivants**: Appariement par classement similaire
3. Évite les répétitions de matchs

---

## Moteur de Scoring

### TennisScoringEngine (`src/sports/tennis/scoring.ts`)

Classe statique avec méthodes immutables (retournent un nouvel état):

### `awardPoint(score, playerId, playerIds?)`

```typescript
// Incrémente les points du joueur dans le jeu en cours
// Gère automatiquement:
// - Progression 0 → 15 → 30 → 40
// - Deuce (40-40)
// - Avantage
// - Victoire du jeu → appelle awardGame()
```

### `awardGame(score, playerId, playerIds?)`

```typescript
// Incrémente les jeux du joueur dans le set en cours
// Gère automatiquement:
// - Reset du score de jeu
// - Victoire du set (6-X avec 2 jeux d'écart)
// - Déclenchement du tie-break à 6-6
// - Victoire du set → appelle awardSet()
```

### `awardTiebreakPoint(score, playerId, playerIds?)`

```typescript
// Incrémente le score de tie-break
// Premier à 7 avec 2 points d'écart gagne le set
```

### `awardSet(score, playerId, playerIds?)`

```typescript
// Incrémente les sets gagnés
// Vérifie la victoire du match:
// - Best of 3: 2 sets pour gagner
// - Best of 5: 3 sets pour gagner
// Si match non terminé: initialise un nouveau set
```

### `initializeMatch(config)`

```typescript
// Crée un état de score initial
const score: TennisMatchScore = {
  player1Sets: 0,
  player2Sets: 0,
  sets: [{ player1Games: 0, player2Games: 0, isTiebreak: false }],
  currentSet: 0,
  currentGame: { player1Points: 0, player2Points: 0, isDeuce: false },
  isComplete: false
};
```

### Affichage du Score

```typescript
// Score du jeu en cours
getGameScoreDisplay(game): { p1: string; p2: string }
// Exemples: { p1: "15", p2: "40" }
//           { p1: "AD", p2: "40" }
//           { p1: "DEUCE", p2: "DEUCE" }

// Score complet du match
getScoreDisplay(score): string
// Exemple: "6-4, 3-2 (7-5)"
```

---

## Affichage en Arena

### TennisRulesModule

Composant d'affichage des règles du tournoi (`src/features/tournament/components/arena/TennisRulesModule.tsx`):

```tsx
<TennisRulesModule config={tournament.tennisConfig} />
```

**Informations affichées:**
- Format (3 ou 5 sets)
- Surface
- Règles de tie-break
- Type de scoring (Avantage / No-Ad)
- Coaching autorisé/interdit
- Temps réglementaires (warmup, changeover, shot clock)

### Intégration

Dans `TournamentArenaPage.tsx`:

```tsx
{tournament.sport === 'tennis' && tournament.tennisConfig && (
  <TennisRulesModule config={tournament.tennisConfig} />
)}
```

---

## Flux de Données Complet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. WIZARD - Sélection du Preset                             │
│    TennisPresetSelector → setTennisPreset(id)               │
│                        → setTennisConfig(preset.config)     │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. WIZARD - Sélection du Format Tournoi                     │
│    FormatAndRules → setFormat('single_elimination')         │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. WIZARD - Ajout des Joueurs                               │
│    PlayerSelection → addPlayer() / addExistingPlayer()      │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CRÉATION - Génération du Tournoi                         │
│    WizardLayout.handleCreateTournament()                    │
│    ├── TournamentEngine.generateBracket(players, format)    │
│    ├── Tournament { tennisConfig, rounds, players }         │
│    └── tournamentStore.createTournament() → localStorage    │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. ARENA - Affichage et Scoring                             │
│    TournamentArenaPage                                      │
│    ├── BracketDisplay (matchs)                              │
│    ├── TennisRulesModule (règles)                           │
│    └── MatchModal → TennisScoringEngine                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Exemples d'Utilisation

### Créer un Tournoi Roland Garros

1. Mode: Instant
2. Sport: Tennis (par défaut)
3. Preset: Roland Garros 🇫🇷
4. Format: Single Elimination
5. Joueurs: 8 participants
6. Lancer

**Configuration appliquée:**
- 5 sets
- Terre battue
- Pas de tie-break au 5ème set
- Avantage classique
- Coaching autorisé

### Créer un Tournoi Club (Personnalisé)

1. Mode: Planned
2. Nom: "Tournoi d'été 2025"
3. Sport: Tennis
4. Preset: Custom ⚙️
5. Personnaliser:
   - 3 sets
   - No-Ad scoring
   - Changements: 60s
6. Format: Round Robin (8 joueurs max)
7. Lancer

---

## Limitations Actuelles

1. **Double Elimination** non implémenté
2. **Live Scoring** (point par point) en placeholder
3. **Statistiques de match** (aces, double fautes, etc.) non trackées
4. **Tie-break at 12-12** de Wimbledon non géré spécifiquement
5. **Schedule Preview** (étape 5 planned) est un placeholder
