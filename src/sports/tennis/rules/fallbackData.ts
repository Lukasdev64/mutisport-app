import type { SportRule } from '@/types/rules';

/**
 * Fallback tennis rules data for offline/development mode
 * Based on ITF Rules of Tennis 2025
 */
export const TENNIS_FALLBACK_RULES: SportRule[] = [
  // LE COURT
  {
    id: 'court-1',
    sport: 'tennis',
    categoryId: 'court',
    categoryName: 'Le Court',
    categoryOrder: 1,
    title: 'Dimensions du Court',
    slug: 'dimensions-court',
    content: `## Dimensions officielles du court de tennis

Le court est un terrain rectangulaire aux dimensions suivantes :

- **Longueur totale** : 23,77 metres (78 pieds)
- **Largeur simple** : 8,23 metres (27 pieds)
- **Largeur double** : 10,97 metres (36 pieds)

### Zones du court

- **Ligne de fond** : delimite la longueur du court
- **Ligne de service** : situee a 6,40 m du filet
- **Couloir** : zone supplementaire de 1,37 m de chaque cote pour le double
- **Carre de service** : zone de 6,40 m x 4,115 m

### Le filet

- Hauteur au centre : 0,914 m (3 pieds)
- Hauteur aux poteaux : 1,07 m (3 pieds 6 pouces)`,
    summary: 'Dimensions officielles du court selon ITF : 23,77m x 8,23m (simple)',
    tags: ['court', 'dimensions', 'filet'],
    source: 'ITF Rules of Tennis 2025',
    sourceUrl: 'https://www.itftennis.com/media/7222/2025-rules-of-tennis-french.pdf',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'court-2',
    sport: 'tennis',
    categoryId: 'court',
    categoryName: 'Le Court',
    categoryOrder: 1,
    title: 'Les Surfaces de Jeu',
    slug: 'surfaces-jeu',
    content: `## Les differentes surfaces de tennis

### Terre battue (Clay)
- Surface lente qui favorise les echanges longs
- La balle rebondit plus haut et plus lentement
- Exemple : Roland Garros

### Surface dure (Hard Court)
- Vitesse moyenne a rapide
- Rebond regulier et previsible
- Exemple : US Open, Open d'Australie

### Gazon (Grass)
- Surface rapide avec rebond bas
- Favorise le jeu de service-volee
- Exemple : Wimbledon

### Surface synthetique (Indoor)
- Caracteristiques variables selon le type
- Souvent utilisee pour les tournois en salle`,
    summary: 'Les quatre principales surfaces : terre battue, dur, gazon, synthetique',
    tags: ['court', 'surface', 'terre-battue', 'gazon', 'dur'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // LE SERVICE
  {
    id: 'service-1',
    sport: 'tennis',
    categoryId: 'service',
    categoryName: 'Le Service',
    categoryOrder: 2,
    title: 'Position du Serveur',
    slug: 'position-serveur',
    content: `## Regles de positionnement au service

### Position initiale

Avant de servir, le serveur doit :
- Se tenir derriere la ligne de fond
- Etre entre la marque centrale et la ligne de cote
- Avoir les deux pieds au sol

### Alternance des cotes

- **Premier point** : service depuis la droite (cote egalite)
- **Deuxieme point** : service depuis la gauche (cote avantage)
- Alternance a chaque point du jeu

### Zone cible

La balle doit atterrir dans le carre de service diagonalement oppose :
- Du cote droit, viser le carre gauche adverse
- Du cote gauche, viser le carre droit adverse`,
    summary: 'Regles de positionnement et alternance au service',
    tags: ['service', 'position', 'alternance'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service-2',
    sport: 'tennis',
    categoryId: 'service',
    categoryName: 'Le Service',
    categoryOrder: 2,
    title: 'Execution du Service',
    slug: 'execution-service',
    content: `## Comment executer un service valide

### Procedure

1. **Lancer la balle** : le serveur lance la balle en l'air avec la main
2. **Frapper la balle** : avant qu'elle ne touche le sol
3. **Trajectoire** : la balle doit passer au-dessus du filet
4. **Zone d'arrivee** : atterrir dans le carre de service correct

### Regles importantes

- Le service n'est termine que lorsque le serveur frappe la balle ou echoue a la frapper
- Le serveur dispose de **deux tentatives** par point
- Un joueur peut lancer la balle et la rattraper sans penalite

### Cas particuliers

- Si la balle touche le filet et tombe dans le bon carre : **let** (a rejouer)
- Si la balle touche le filet et sort : **faute**`,
    summary: 'Procedure complete pour executer un service valide',
    tags: ['service', 'execution', 'technique'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // LES FAUTES
  {
    id: 'fautes-1',
    sport: 'tennis',
    categoryId: 'fautes',
    categoryName: 'Les Fautes',
    categoryOrder: 3,
    title: 'Faute de Pied',
    slug: 'faute-pied',
    content: `## La faute de pied (Foot Fault)

### Definition

Une faute de pied est commise lorsque le serveur :
- **Touche la ligne de fond** avec un pied pendant le service
- **Franchit la ligne de fond** avant de frapper la balle
- **Change de position** en marchant ou courant

### Ce qui est autorise

- Sauter pendant le service (les deux pieds peuvent quitter le sol)
- Atterrir a l'interieur du court apres avoir frappe
- Avoir un pied en l'air tant que l'autre reste derriere la ligne

### Consequence

Une faute de pied compte comme une **faute de service** :
- Premiere faute : le serveur peut rejouer avec sa deuxieme balle
- Deuxieme faute de pied : **double faute**, point perdu`,
    summary: 'Le serveur ne doit pas toucher ou franchir la ligne de fond',
    tags: ['faute', 'service', 'foot-fault', 'pied'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fautes-2',
    sport: 'tennis',
    categoryId: 'fautes',
    categoryName: 'Les Fautes',
    categoryOrder: 3,
    title: 'Double Faute',
    slug: 'double-faute',
    content: `## La double faute

### Definition

Une double faute se produit lorsque le serveur rate ses deux tentatives de service consecutivement.

### Causes possibles

- Balle dans le filet (deux fois)
- Balle hors du carre de service (deux fois)
- Faute de pied (deux fois)
- Combinaison de ces erreurs

### Consequence

- Le **point est perdu** par le serveur
- Le relanceur gagne le point sans avoir joue

### Statistiques

En tennis professionnel, une double faute toutes les 15-20 premiers services est consideree acceptable.`,
    summary: 'Deux fautes de service consecutives = point perdu',
    tags: ['faute', 'service', 'double-faute'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // LE COMPTAGE DES POINTS
  {
    id: 'scoring-1',
    sport: 'tennis',
    categoryId: 'scoring',
    categoryName: 'Le Comptage des Points',
    categoryOrder: 4,
    title: 'Systeme de Points',
    slug: 'systeme-points',
    content: `## Le comptage des points au tennis

### Points dans un jeu

Le score suit une progression particuliere :
- **0** = "Zero" ou "Love"
- **1 point** = 15
- **2 points** = 30
- **3 points** = 40
- **4 points** = Jeu (si 2 points d'avance)

### Ordre d'annonce

Le score du serveur est annonce en premier :
- "15-0" = le serveur mene
- "0-15" = le relanceur mene
- "15-15" = egalite a 15

### Egalite a 40-40 : Deuce

Quand les deux joueurs sont a 40, c'est "Deuce" (egalite).
- Il faut alors gagner **2 points consecutifs** pour gagner le jeu.`,
    summary: 'Points : 0, 15, 30, 40, Jeu - score du serveur annonce en premier',
    tags: ['scoring', 'points', 'jeu', 'debutant'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'scoring-2',
    sport: 'tennis',
    categoryId: 'scoring',
    categoryName: 'Le Comptage des Points',
    categoryOrder: 4,
    title: 'Deuce et Avantage',
    slug: 'deuce-avantage',
    content: `## Le systeme Deuce/Avantage

### Deuce (Egalite)

Lorsque le score atteint 40-40, on parle de "Deuce".

### Avantage

Le joueur qui marque le point suivant obtient l'**avantage** :
- "Avantage serveur" (Ad-In) si le serveur gagne le point
- "Avantage relanceur" (Ad-Out) si le relanceur gagne le point

### Gagner le jeu depuis l'avantage

- Si le joueur avec l'avantage gagne le point suivant : **il gagne le jeu**
- Si l'autre joueur gagne : retour a **Deuce**

### Variante : No-Ad (Sans avantage)

Dans certains formats (ex: Next Gen ATP Finals) :
- A 40-40, un seul point decide du jeu
- Le relanceur choisit le cote de reception`,
    summary: 'A 40-40 (Deuce), il faut 2 points d\'ecart pour gagner le jeu',
    tags: ['scoring', 'deuce', 'avantage', 'no-ad'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'scoring-3',
    sport: 'tennis',
    categoryId: 'scoring',
    categoryName: 'Le Comptage des Points',
    categoryOrder: 4,
    title: 'Jeux et Sets',
    slug: 'jeux-sets',
    content: `## Structure d'un match de tennis

### Les Jeux

- Un **jeu** se gagne en atteignant 4 points avec 2 points d'avance
- Le service alterne entre les joueurs a chaque jeu

### Les Sets

- Un **set** se gagne en atteignant **6 jeux** avec 2 jeux d'avance
- Scores possibles pour gagner un set : 6-0, 6-1, 6-2, 6-3, 6-4, 7-5
- A 6-6 : generalement un **tie-break** est joue

### Les Matchs

Les formats de match les plus courants :
- **Meilleur des 3 sets** (2 sets gagnants) - Standard ATP/WTA
- **Meilleur des 5 sets** (3 sets gagnants) - Grands Chelems masculins`,
    summary: '6 jeux pour un set (avec 2 d\'ecart), format en 2 ou 3 sets gagnants',
    tags: ['scoring', 'jeux', 'sets', 'match'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // LE TIE-BREAK
  {
    id: 'tiebreak-1',
    sport: 'tennis',
    categoryId: 'tiebreak',
    categoryName: 'Le Tie-Break',
    categoryOrder: 5,
    title: 'Regles du Tie-Break',
    slug: 'regles-tiebreak',
    content: `## Le Tie-Break standard

### Quand le jouer ?

Le tie-break est generalement joue quand le score atteint **6-6** dans un set.

### Comment gagner ?

- Premier a **7 points** avec **2 points d'avance**
- Si 6-6 au tie-break : continuer jusqu'a 2 points d'ecart
- Scores possibles : 7-0, 7-1, ..., 7-5, 8-6, 9-7, etc.

### Service pendant le tie-break

1. **Premier point** : le joueur dont c'est le tour sert (1 service)
2. **Points 2 et 3** : l'adversaire sert (2 services)
3. **Points 4 et 5** : le premier joueur sert (2 services)
4. Alternance tous les 2 points ensuite

### Changement de cote

Les joueurs changent de cote tous les **6 points** (apres 6, 12, 18...).`,
    summary: 'Premier a 7 points avec 2 d\'ecart, alterne le service tous les 2 points',
    tags: ['tiebreak', 'scoring', '6-6'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tiebreak-2',
    sport: 'tennis',
    categoryId: 'tiebreak',
    categoryName: 'Le Tie-Break',
    categoryOrder: 5,
    title: 'Super Tie-Break',
    slug: 'super-tiebreak',
    content: `## Le Super Tie-Break (10 points)

### Definition

Le super tie-break est un tie-break prolonge qui se joue en **10 points** au lieu de 7.

### Quand est-il utilise ?

- **Set decisif** : en remplacement du 3e set (ou 5e set) complet
- Formats ATP Doubles et mixte
- Certains tournois pour accelerer les matchs

### Regles

- Premier a **10 points** avec **2 points d'avance**
- Memes regles de service que le tie-break standard
- Changement de cote tous les 6 points

### Exemples de scores

- 10-0, 10-1, ..., 10-8, 11-9, 12-10, etc.

### Avantage

Permet de decider un match serre sans jouer un set complet qui pourrait durer longtemps.`,
    summary: 'Tie-break en 10 points utilise comme set decisif',
    tags: ['tiebreak', 'super-tiebreak', '10-points', 'set-decisif'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // LE LET
  {
    id: 'let-1',
    sport: 'tennis',
    categoryId: 'let',
    categoryName: 'Le Let',
    categoryOrder: 6,
    title: 'Let au Service',
    slug: 'let-service',
    content: `## Le Let (balle a remettre)

### Let au service

Un "let" est annonce quand la balle de service :
1. Touche le filet ou la sangle
2. **ET** tombe dans le bon carre de service

### Consequence

- Le service est **rejoue** (pas de faute)
- Aucune limite au nombre de lets consecutifs

### Pas de let si...

- La balle touche le filet et sort du carre : c'est une **faute**
- La balle touche le filet pendant l'echange : le jeu continue

### Variante : No-Let

Dans certains tournois (ex: Laver Cup, Next Gen ATP) :
- Un service touchant le filet et entrant dans le carre est **valide**
- Le jeu continue sans interruption`,
    summary: 'Balle touchant le filet au service et entrant dans le carre = a rejouer',
    tags: ['let', 'service', 'filet'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // LE DOUBLE
  {
    id: 'doubles-1',
    sport: 'tennis',
    categoryId: 'doubles',
    categoryName: 'Le Double',
    categoryOrder: 7,
    title: 'Regles Specifiques du Double',
    slug: 'regles-double',
    content: `## Regles specifiques au double

### Le court

- Utilisation des **couloirs** (1,37m de chaque cote)
- Court plus large : 10,97m au lieu de 8,23m

### Le service

- Chaque equipe designe un **ordre de service** au debut du set
- Les partenaires alternent les jeux de service
- L'ordre ne peut pas changer pendant le set

### La reception

- Chaque equipe choisit **qui recoit de chaque cote**
- Un joueur recoit toujours du meme cote pendant le set
- L'ordre peut changer au set suivant

### Positions

- Les partenaires peuvent se placer n'importe ou sur leur moitie
- Formation classique : un au filet, un au fond`,
    summary: 'Court elargi avec couloirs, alternance service au sein de l\'equipe',
    tags: ['double', 'equipe', 'couloirs'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // CODE DE CONDUITE
  {
    id: 'conduct-1',
    sport: 'tennis',
    categoryId: 'conduct',
    categoryName: 'Le Code de Conduite',
    categoryOrder: 8,
    title: 'Violations et Penalites',
    slug: 'violations-penalites',
    content: `## Le Code de Conduite

### Violations courantes

- **Abus de raquette** : jeter ou casser sa raquette
- **Abus verbal** : insultes ou langage obscene
- **Abus physique** : gestes dangereux
- **Coaching illegal** : recevoir des conseils de l'exterieur
- **Retard de jeu** : depasser le temps imparti entre les points

### Echelle des penalites

1. **Avertissement** : premiere violation
2. **Point de penalite** : deuxieme violation
3. **Jeu de penalite** : troisieme violation
4. **Disqualification** : violations graves ou repetees

### Violations directes

Certaines violations entrainent une penalite immediate sans avertissement :
- Abus physique envers une personne
- Comportement antisportif grave`,
    summary: 'Echelle : avertissement, point, jeu, disqualification',
    tags: ['conduite', 'violation', 'penalite', 'arbitre'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // REPOS ET TEMPS
  {
    id: 'rest-1',
    sport: 'tennis',
    categoryId: 'rest',
    categoryName: 'Repos et Temps',
    categoryOrder: 9,
    title: 'Temps de Jeu et Pauses',
    slug: 'temps-jeu-pauses',
    content: `## Gestion du temps pendant un match

### Entre les points

- Maximum **25 secondes** entre la fin d'un point et le service suivant
- Chronometre visible sur les courts principaux (shot clock)

### Changement de cote

- **90 secondes** de pause lors du changement de cote (jeux impairs)
- Pas de pause apres le 1er jeu de chaque set

### Entre les sets

- **120 secondes** (2 minutes) entre les sets
- Temps pour aller aux toilettes, se changer, boire

### Pauses medicales

- Un joueur peut demander une **pause medicale** pour traitement
- Limitee a 3 minutes pour evaluation + traitement
- Une seule pause par probleme medical

### Pause toilettes

- Une pause toilettes par match en general
- Duree raisonnable (environ 3 minutes)`,
    summary: '25s entre points, 90s changement de cote, 2min entre sets',
    tags: ['temps', 'pause', 'changement', 'repos'],
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Get fallback rules by category
 */
export function getFallbackRulesByCategory(categoryId: string): SportRule[] {
  return TENNIS_FALLBACK_RULES.filter(rule => rule.categoryId === categoryId);
}

/**
 * Get a single fallback rule by slug
 */
export function getFallbackRuleBySlug(slug: string): SportRule | undefined {
  return TENNIS_FALLBACK_RULES.find(rule => rule.slug === slug);
}
