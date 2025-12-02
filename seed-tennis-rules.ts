/**
 * Seed script for Tennis Rules Library
 * Based on ITF Rules of Tennis 2025
 *
 * Usage:
 *   bun run seed-tennis-rules.ts
 *
 * Environment variables required:
 *   - SUPABASE_URL or VITE_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Tennis rules data based on ITF Rules 2025
const tennisRules = [
  // =============================================
  // LE COURT
  // =============================================
  {
    sport: 'tennis',
    category_id: 'court',
    category_name: 'Le Court',
    category_order: 1,
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
- Hauteur aux poteaux : 1,07 m (3 pieds 6 pouces)
- Largeur : egale a la largeur du court plus les couloirs`,
    summary: 'Dimensions officielles du court selon ITF : 23,77m x 8,23m (simple)',
    tags: ['court', 'dimensions', 'filet', 'lignes'],
    keywords: 'dimensions court tennis metres pieds filet hauteur largeur longueur',
    source: 'ITF Rules of Tennis 2025',
    source_url: 'https://www.itftennis.com/media/7222/2025-rules-of-tennis-french.pdf',
    difficulty: 'beginner',
  },
  {
    sport: 'tennis',
    category_id: 'court',
    category_name: 'Le Court',
    category_order: 1,
    title: 'Les Surfaces de Jeu',
    slug: 'surfaces-jeu',
    content: `## Les differentes surfaces de tennis

### Terre battue (Clay)
- Surface lente qui favorise les echanges longs
- La balle rebondit plus haut et plus lentement
- Favorise les joueurs de fond de court
- Exemple : Roland Garros

### Surface dure (Hard Court)
- Vitesse moyenne a rapide
- Rebond regulier et previsible
- Surface la plus repandue dans le monde
- Exemple : US Open, Open d'Australie

### Gazon (Grass)
- Surface rapide avec rebond bas et irregulier
- Favorise le jeu de service-volee
- Necessite un entretien particulier
- Exemple : Wimbledon

### Surface synthetique (Indoor)
- Caracteristiques variables selon le type
- Souvent utilisee pour les tournois en salle
- Permet de jouer toute l'annee

### Impact sur le jeu
Chaque surface influence la strategie de jeu, la vitesse des echanges et les types de coups les plus efficaces.`,
    summary: 'Les quatre principales surfaces : terre battue, dur, gazon, synthetique',
    tags: ['court', 'surface', 'terre-battue', 'gazon', 'dur', 'indoor'],
    keywords: 'surface terre battue clay hard court gazon grass indoor synthetique rebond',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
  },
  {
    sport: 'tennis',
    category_id: 'court',
    category_name: 'Le Court',
    category_order: 1,
    title: 'Les Lignes du Court',
    slug: 'lignes-court',
    content: `## Les lignes du court de tennis

### Lignes de delimitation

- **Lignes de fond** : lignes paralleles au filet situees aux extremites du court
- **Lignes de cote (simple)** : lignes perpendiculaires au filet delimitant le court de simple
- **Lignes de cote (double)** : lignes exterieures delimitant le court de double

### Lignes de service

- **Ligne de service** : ligne parallele au filet a 6,40 m de celui-ci
- **Ligne mediane de service** : divise les deux carres de service
- **Marque centrale** : petite marque sur la ligne de fond indiquant le milieu

### Regle importante

**Une balle qui touche la ligne est consideree comme BONNE.**

Les lignes font partie integrante de la zone qu'elles delimitent. Cela signifie qu'une balle touchant meme partiellement la ligne est valide.

### Largeur des lignes

- Toutes les lignes : entre 2,5 cm et 5 cm de large
- La ligne de fond peut avoir jusqu'a 10 cm de large`,
    summary: 'Les differentes lignes et leur role, une balle sur la ligne est bonne',
    tags: ['court', 'lignes', 'fond', 'service', 'cote'],
    keywords: 'ligne fond service cote mediane balle bonne valide touche',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
  },

  // =============================================
  // LE SERVICE
  // =============================================
  {
    sport: 'tennis',
    category_id: 'service',
    category_name: 'Le Service',
    category_order: 2,
    title: 'Position du Serveur',
    slug: 'position-serveur',
    content: `## Regles de positionnement au service

### Position initiale

Avant de servir, le serveur doit :
- Se tenir derriere la ligne de fond
- Etre entre la marque centrale et la ligne de cote (simple ou double selon le format)
- Avoir les deux pieds au sol

### Alternance des cotes

- **Premier point** : service depuis la droite (cote egalite/deuce)
- **Deuxieme point** : service depuis la gauche (cote avantage/ad)
- Alternance a chaque point du jeu

### Zone cible

La balle doit atterrir dans le carre de service diagonalement oppose :
- Du cote droit, viser le carre gauche adverse
- Du cote gauche, viser le carre droit adverse

### Erreur de position

Si le serveur sert du mauvais cote, le point reste valide une fois joue, mais la bonne position doit etre reprise immediatement.`,
    summary: 'Regles de positionnement et alternance au service',
    tags: ['service', 'position', 'alternance', 'cote'],
    keywords: 'position serveur cote deuce avantage alternance ligne fond',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
  },
  {
    sport: 'tennis',
    category_id: 'service',
    category_name: 'Le Service',
    category_order: 2,
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
- Un joueur peut lancer la balle et la rattraper sans penalite (tant qu'il n'a pas fait de mouvement de frappe)

### Timing

- Le serveur doit servir rapidement (25 secondes max entre les points)
- Le relanceur doit jouer au rythme raisonnable du serveur

### Cas particuliers

- Si la balle touche le filet et tombe dans le bon carre : **let** (a rejouer)
- Si la balle touche le filet et sort : **faute**`,
    summary: 'Procedure complete pour executer un service valide',
    tags: ['service', 'execution', 'technique', 'procedure'],
    keywords: 'service lancer frapper balle filet carre procedure execution',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
  },
  {
    sport: 'tennis',
    category_id: 'service',
    category_name: 'Le Service',
    category_order: 2,
    title: 'Ordre de Service',
    slug: 'ordre-service',
    content: `## L'ordre de service dans un match

### Determination du premier serveur

Le premier serveur est determine par **tirage au sort** (pile ou face, ou rotation de raquette).

Le gagnant du tirage peut choisir :
- De servir ou recevoir en premier
- OU de choisir le cote du court

Le perdant fait alors l'autre choix.

### Alternance des jeux

- Les joueurs alternent le service a chaque jeu
- L'ordre ne change pas pendant le set
- Au debut du 2e set, c'est celui qui a recu au dernier jeu du 1er set qui sert

### Alternance des cotes

Les joueurs changent de cote :
- Apres le 1er jeu
- Puis tous les 2 jeux (jeux impairs : 3, 5, 7...)
- A la fin de chaque set si le total des jeux est impair

### En double

Chaque equipe determine son propre ordre de service au debut du set. L'ordre ne peut pas changer pendant le set.`,
    summary: 'Tirage au sort, alternance des serveurs et changements de cote',
    tags: ['service', 'ordre', 'alternance', 'tirage', 'cote'],
    keywords: 'ordre service alternance tirage sort changement cote jeu set',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
  },

  // =============================================
  // LES FAUTES
  // =============================================
  {
    sport: 'tennis',
    category_id: 'fautes',
    category_name: 'Les Fautes',
    category_order: 3,
    title: 'Faute de Pied',
    slug: 'faute-pied',
    content: `## La faute de pied (Foot Fault)

### Definition

Une faute de pied est commise lorsque le serveur :
- **Touche la ligne de fond** avec un pied pendant le service
- **Franchit la ligne de fond** avant de frapper la balle
- **Change de position** en marchant ou courant pendant le mouvement de service
- **Touche la zone de jeu** avec l'un ou l'autre pied avant la frappe

### Ce qui est autorise

- Sauter pendant le service (les deux pieds peuvent quitter le sol)
- Atterrir a l'interieur du court apres avoir frappe la balle
- Avoir un pied en l'air tant que l'autre reste derriere la ligne
- Se deplacer lateralement le long de la ligne de fond

### Consequence

Une faute de pied compte comme une **faute de service** :
- Premiere faute : le serveur peut rejouer avec sa deuxieme balle
- Deuxieme faute de pied : **double faute**, point perdu

### A noter

La faute de pied peut etre signalee par l'arbitre de chaise ou un juge de ligne dedie.`,
    summary: 'Le serveur ne doit pas toucher ou franchir la ligne de fond',
    tags: ['faute', 'service', 'foot-fault', 'pied', 'ligne'],
    keywords: 'faute pied foot fault ligne fond serveur touche franchit',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
  },
  {
    sport: 'tennis',
    category_id: 'fautes',
    category_name: 'Les Fautes',
    category_order: 3,
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

### Impact psychologique

La double faute est souvent consideree comme la pire erreur au tennis car :
- Elle donne un point gratuit a l'adversaire
- Elle peut affecter la confiance du serveur
- Elle survient souvent dans les moments de pression

### Statistiques

En tennis professionnel, les meilleurs serveurs ont environ 2-3% de doubles fautes sur l'ensemble de leurs services.`,
    summary: 'Deux fautes de service consecutives = point perdu',
    tags: ['faute', 'service', 'double-faute', 'point'],
    keywords: 'double faute service deux tentatives point perdu',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
  },
  {
    sport: 'tennis',
    category_id: 'fautes',
    category_name: 'Les Fautes',
    category_order: 3,
    title: 'Fautes Pendant l\'Echange',
    slug: 'fautes-echange',
    content: `## Les fautes pendant l'echange

### Balle sortie (Out)

Un joueur perd le point si sa balle :
- Tombe en dehors des lignes du court
- Touche un objet permanent en dehors du court
- Passe au-dessus du filet et revient sans etre touchee par l'adversaire

### Fautes de filet

Un joueur perd le point s'il :
- Touche le filet ou les poteaux pendant l'echange
- Passe sa raquette au-dessus du filet pour frapper la balle avant qu'elle n'ait traverse
- Envoie la balle dans le filet

### Autres fautes

- **Double frappe** : frapper la balle deux fois (sauf mouvement continu)
- **Toucher la balle** : avec le corps ou les vetements
- **Porter la balle** : tenir ou porter la balle sur la raquette
- **Lancer la raquette** : pour frapper la balle

### Exception

Si la balle touche le filet et passe du bon cote pendant l'echange, le jeu continue normalement (contrairement au service ou c'est un let).`,
    summary: 'Fautes pendant le jeu : sortie, filet, double frappe',
    tags: ['faute', 'echange', 'sortie', 'filet', 'out'],
    keywords: 'faute echange sortie out filet double frappe toucher porter',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
  },

  // =============================================
  // LE COMPTAGE DES POINTS
  // =============================================
  {
    sport: 'tennis',
    category_id: 'scoring',
    category_name: 'Le Comptage des Points',
    category_order: 4,
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

### Origine

Cette numerotation viendrait du cadran d'une horloge (0, 15, 30, 45 simplifie en 40).

### Ordre d'annonce

Le score du serveur est toujours annonce en premier :
- "15-0" = le serveur mene
- "0-15" = le relanceur mene
- "15-15" = egalite a 15 (aussi dit "15 partout")

### Egalite a 40-40 : Deuce

Quand les deux joueurs sont a 40, c'est "Deuce" (egalite).
- Il faut alors gagner **2 points consecutifs** pour gagner le jeu
- Le premier point apres Deuce donne l'avantage`,
    summary: 'Points : 0, 15, 30, 40, Jeu - score du serveur annonce en premier',
    tags: ['scoring', 'points', 'jeu', 'love', 'deuce'],
    keywords: 'points 15 30 40 love zero jeu score serveur annonce',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
  },
  {
    sport: 'tennis',
    category_id: 'scoring',
    category_name: 'Le Comptage des Points',
    category_order: 4,
    title: 'Deuce et Avantage',
    slug: 'deuce-avantage',
    content: `## Le systeme Deuce/Avantage

### Deuce (Egalite)

Lorsque le score atteint 40-40, on parle de "Deuce" (egalite).

### Avantage

Le joueur qui marque le point suivant obtient l'**avantage** :
- "Avantage serveur" (Ad-In) si le serveur gagne le point
- "Avantage relanceur" (Ad-Out) si le relanceur gagne le point

### Gagner le jeu depuis l'avantage

- Si le joueur avec l'avantage gagne le point suivant : **il gagne le jeu**
- Si l'autre joueur gagne : retour a **Deuce**

### Exemples de scenarios

1. 40-40 → Serveur gagne → Avantage serveur → Serveur gagne → **Jeu serveur**
2. 40-40 → Relanceur gagne → Avantage relanceur → Serveur gagne → **Deuce**

### Variante : No-Ad (Sans avantage)

Dans certains formats (ex: Next Gen ATP Finals, doubles mixte) :
- A 40-40, un seul point decide du jeu
- Le relanceur choisit le cote de reception (deuce ou avantage)`,
    summary: 'A 40-40 (Deuce), il faut 2 points d\'ecart pour gagner le jeu',
    tags: ['scoring', 'deuce', 'avantage', 'no-ad', 'egalite'],
    keywords: 'deuce avantage 40-40 egalite ad-in ad-out no-ad',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
  },
  {
    sport: 'tennis',
    category_id: 'scoring',
    category_name: 'Le Comptage des Points',
    category_order: 4,
    title: 'Jeux et Sets',
    slug: 'jeux-sets',
    content: `## Structure d'un match de tennis

### Les Jeux

- Un **jeu** se gagne en atteignant 4 points avec 2 points d'avance
- Le service alterne entre les joueurs a chaque jeu
- Minimum 4 points pour gagner un jeu (si mene 40-0)
- Pas de maximum si les joueurs sont a egalite (deuce)

### Les Sets

- Un **set** se gagne en atteignant **6 jeux** avec 2 jeux d'avance
- Scores possibles pour gagner un set : 6-0, 6-1, 6-2, 6-3, 6-4, 7-5
- A 6-6 : generalement un **tie-break** est joue

### Les Matchs

Les formats de match les plus courants :

**Best of 3 (2 sets gagnants)**
- Format standard ATP Tour, WTA
- Le vainqueur est le premier a 2 sets

**Best of 5 (3 sets gagnants)**
- Grands Chelems (simple messieurs)
- Coupe Davis (historiquement)
- Le vainqueur est le premier a 3 sets`,
    summary: '6 jeux pour un set (avec 2 d\'ecart), format en 2 ou 3 sets gagnants',
    tags: ['scoring', 'jeux', 'sets', 'match', 'format'],
    keywords: 'jeu set match best of trois cinq format gagner',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
  },

  // =============================================
  // LE TIE-BREAK
  // =============================================
  {
    sport: 'tennis',
    category_id: 'tiebreak',
    category_name: 'Le Tie-Break',
    category_order: 5,
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

1. **Premier point** : le joueur dont c'est le tour sert (1 seul service depuis le cote droit)
2. **Points 2 et 3** : l'adversaire sert (2 services, d'abord gauche puis droit)
3. **Points 4 et 5** : le premier joueur sert (2 services)
4. Alternance tous les 2 points ensuite

### Changement de cote

Les joueurs changent de cote tous les **6 points** (apres les points 6, 12, 18...).

### Score du set

Le vainqueur du tie-break gagne le set **7-6**. Le score du tie-break est note entre parentheses : 7-6 (5) signifie que le perdant a marque 5 points.`,
    summary: 'Premier a 7 points avec 2 d\'ecart, alterne le service tous les 2 points',
    tags: ['tiebreak', 'scoring', '6-6', 'service'],
    keywords: 'tiebreak tie-break 7 points service alternance 6-6 set',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
  },
  {
    sport: 'tennis',
    category_id: 'tiebreak',
    category_name: 'Le Tie-Break',
    category_order: 5,
    title: 'Super Tie-Break',
    slug: 'super-tiebreak',
    content: `## Le Super Tie-Break (10 points)

### Definition

Le super tie-break est un tie-break prolonge qui se joue en **10 points** au lieu de 7.

### Quand est-il utilise ?

- **Set decisif** : en remplacement du 3e set (ou 5e set) complet
- Formats ATP/WTA Doubles
- Certains tournois ITF
- Doubles mixte en Grand Chelem

### Regles

- Premier a **10 points** avec **2 points d'avance**
- Memes regles de service que le tie-break standard (alternance tous les 2 points)
- Changement de cote tous les 6 points

### Exemples de scores

- 10-0, 10-1, ..., 10-8, 11-9, 12-10, 15-13, etc.

### Avantages

- Permet de decider un match serre sans jouer un set complet
- Reduit la duree des matchs
- Ajoute du suspense avec le format "tout se joue sur un jeu"

### Dans les Grands Chelems

Depuis 2019-2022, tous les Grands Chelems utilisent un tie-break au set decisif (mais pas forcement le super tie-break).`,
    summary: 'Tie-break en 10 points utilise comme set decisif',
    tags: ['tiebreak', 'super-tiebreak', '10-points', 'set-decisif', 'double'],
    keywords: 'super tiebreak 10 points set decisif double match',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
  },
  {
    sport: 'tennis',
    category_id: 'tiebreak',
    category_name: 'Le Tie-Break',
    category_order: 5,
    title: 'Tie-Break au Set Decisif',
    slug: 'tiebreak-set-decisif',
    content: `## Le tie-break dans le set decisif des Grands Chelems

### Regles actuelles (2024-2025)

Chaque Grand Chelem a ses propres regles pour le set decisif :

**Open d'Australie**
- Tie-break standard a 6-6 (premier a 7)

**Roland Garros**
- Tie-break standard a 6-6 (depuis 2022)
- Historiquement, pas de tie-break au 5e set

**Wimbledon**
- Tie-break standard a 6-6 (depuis 2022)
- Avant : tie-break uniquement a 12-12

**US Open**
- Tie-break standard a 6-6 (historiquement le premier)

### Pourquoi ces changements ?

Les matchs marathons comme Isner-Mahut (70-68 au 5e set, 11h05 de jeu) ont pousse les organisateurs a adopter des tie-breaks.

### Format actuel unifie

Depuis 2022, les quatre Grands Chelems utilisent un tie-break au set decisif, mettant fin aux matchs interminables tout en preservant le spectacle.`,
    summary: 'Depuis 2022, tous les Grands Chelems ont un tie-break au set decisif',
    tags: ['tiebreak', 'grand-chelem', 'set-decisif', 'wimbledon', 'roland-garros'],
    keywords: 'grand chelem set decisif wimbledon roland garros us open australie',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'advanced',
  },

  // =============================================
  // LE LET
  // =============================================
  {
    sport: 'tennis',
    category_id: 'let',
    category_name: 'Le Let',
    category_order: 6,
    title: 'Let au Service',
    slug: 'let-service',
    content: `## Le Let (balle a remettre)

### Let au service

Un "let" est annonce quand la balle de service :
1. Touche le filet, la sangle ou la bande
2. **ET** tombe dans le bon carre de service

### Consequence

- Le service est **rejoue** (pas de faute)
- Aucune limite au nombre de lets consecutifs
- Le compteur de fautes n'est pas affecte

### Pas de let si...

- La balle touche le filet et sort du carre : c'est une **faute**
- La balle touche le filet et tombe dans le mauvais carre : c'est une **faute**
- La balle touche le filet pendant l'echange : le jeu continue normalement

### Detection

Le let peut etre detecte par :
- L'arbitre de chaise
- Un systeme electronique (Net sensor)
- Auto-arbitrage (en l'absence d'arbitre)

### Variante : No-Let

Dans certains tournois (ex: Next Gen ATP Finals, Laver Cup) :
- Un service touchant le filet et entrant dans le carre est **valide**
- Le jeu continue sans interruption
- Cette regle accelere le jeu`,
    summary: 'Balle touchant le filet au service et entrant dans le carre = a rejouer',
    tags: ['let', 'service', 'filet', 'rejouer'],
    keywords: 'let filet service balle rejouer touche net',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'beginner',
  },
  {
    sport: 'tennis',
    category_id: 'let',
    category_name: 'Le Let',
    category_order: 6,
    title: 'Let et Interruptions',
    slug: 'let-interruptions',
    content: `## Let pour interruption de jeu

### Quand rejouer un point ?

Un let peut etre accorde si le jeu est interrompu par :
- Une balle d'un autre court qui entre en jeu
- Un objet etranger sur le court
- Un spectateur qui interfere
- Une situation dangereuse
- Une erreur d'arbitrage (appel incorrect immediatement corrige)

### Procedure

1. L'arbitre annonce "Let" ou un joueur le demande
2. Le point est annule
3. Le point entier est rejoue (y compris le premier service)

### Ce qui n'est PAS un let

- Un joueur qui glisse ou tombe
- Le bruit des spectateurs (sauf perturbation majeure)
- Conditions meteorologiques (pluie, vent) sauf decision de l'arbitre
- Un joueur qui n'est pas pret (c'est sa responsabilite)

### Delai raisonnable

Si l'interruption est longue (meteo, eclairage defaillant), le jeu peut etre suspendu et reprendre plus tard au meme score.`,
    summary: 'Let possible en cas d\'interruption : balle exterieure, objet, spectateur',
    tags: ['let', 'interruption', 'balle', 'arbitre'],
    keywords: 'let interruption balle objet spectateur rejouer point',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
  },

  // =============================================
  // LE DOUBLE
  // =============================================
  {
    sport: 'tennis',
    category_id: 'doubles',
    category_name: 'Le Double',
    category_order: 7,
    title: 'Regles Specifiques du Double',
    slug: 'regles-double',
    content: `## Regles specifiques au double

### Le court

- Utilisation des **couloirs** (1,37m de chaque cote)
- Court plus large : 10,97m au lieu de 8,23m
- Les lignes de couloir sont valides pour tous les coups

### Le service

- Chaque equipe designe un **ordre de service** au debut du set
- Les partenaires alternent les jeux de service au sein de l'equipe
- L'ordre ne peut pas changer pendant le set (mais peut changer au set suivant)

### La reception

- Chaque equipe choisit **qui recoit de chaque cote**
- Un joueur recoit toujours du meme cote pendant le set
- L'ordre peut changer au set suivant

### Positions

- Les partenaires peuvent se placer n'importe ou sur leur moitie
- Formation classique : un au filet, un au fond
- Formation australienne : les deux du meme cote (tactique)

### Qui peut toucher la balle ?

Un seul partenaire peut frapper la balle. Si les deux touchent, c'est une faute.`,
    summary: 'Court elargi avec couloirs, alternance service au sein de l\'equipe',
    tags: ['double', 'equipe', 'couloirs', 'service', 'reception'],
    keywords: 'double equipe couloirs partenaire service reception formation',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
  },
  {
    sport: 'tennis',
    category_id: 'doubles',
    category_name: 'Le Double',
    category_order: 7,
    title: 'Double Mixte',
    slug: 'double-mixte',
    content: `## Le double mixte

### Definition

Le double mixte est une discipline ou chaque equipe est composee d'un homme et d'une femme.

### Regles identiques au double

- Memes dimensions de court (avec couloirs)
- Memes regles de service et reception
- Memes regles de score

### Particularites en Grand Chelem

- **Format** : meilleur des 3 sets avec super tie-break (10 points) au set decisif
- Presente dans les 4 Grands Chelems
- Souvent joue en parallele des simples

### Jeux Olympiques

Le double mixte est au programme olympique depuis Tokyo 2020, offrant une medaille supplementaire.

### Strategie

- Les equipes mixtes doivent souvent adapter leur positionnement
- La communication entre partenaires est essentielle
- Les differences de puissance de frappe sont gerees tacticalement`,
    summary: 'Equipe homme + femme, regles identiques au double standard',
    tags: ['double', 'mixte', 'equipe', 'homme', 'femme'],
    keywords: 'double mixte homme femme equipe grand chelem olympique',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
  },

  // =============================================
  // CODE DE CONDUITE
  // =============================================
  {
    sport: 'tennis',
    category_id: 'conduct',
    category_name: 'Le Code de Conduite',
    category_order: 8,
    title: 'Violations et Penalites',
    slug: 'violations-penalites',
    content: `## Le Code de Conduite

### Violations courantes

- **Abus de raquette** : jeter, frapper ou casser sa raquette
- **Abus verbal** : insultes, langage obscene
- **Abus physique** : gestes dangereux envers une personne
- **Coaching illegal** : recevoir des conseils de l'exterieur (selon les regles du tournoi)
- **Retard de jeu** : depasser le temps imparti entre les points (25 sec)
- **Comportement antisportif** : tricherie, obstruction

### Echelle des penalites

1. **Avertissement** (Warning) : premiere violation
2. **Point de penalite** : deuxieme violation
3. **Jeu de penalite** : troisieme violation
4. **Disqualification** : violations repetees ou comportement grave

### Violations avec penalite immediate

Certaines violations entrainent une penalite directe sans avertissement :
- Abus physique envers une personne
- Comportement antisportif grave
- Quitter le court sans autorisation

### Remise a zero

L'echelle des penalites est remise a zero entre les matchs.`,
    summary: 'Echelle : avertissement, point, jeu, disqualification',
    tags: ['conduite', 'violation', 'penalite', 'avertissement', 'disqualification'],
    keywords: 'violation penalite avertissement point jeu disqualification conduite',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
  },
  {
    sport: 'tennis',
    category_id: 'conduct',
    category_name: 'Le Code de Conduite',
    category_order: 8,
    title: 'Coaching et Communication',
    slug: 'coaching-communication',
    content: `## Regles sur le coaching

### Historique

Traditionnellement, le tennis interdit toute communication entre le joueur et son coach pendant les matchs.

### Evolution recente

L'ATP et la WTA ont assoupli ces regles :
- **WTA** : coaching autorise depuis 2008 (avec restrictions)
- **ATP** : test de coaching au changement de cote depuis 2022

### Regles actuelles (varies selon les tournois)

**Autorise generalement** :
- Communication au changement de cote
- Signaux visuels depuis les tribunes (WTA)
- Coaching pendant les pauses officielles

**Interdit** :
- Communication pendant le point
- Crier des conseils pendant l'echange
- Descendre sur le court (sauf pause autorisee)

### En Grand Chelem

Les Grands Chelems ont leurs propres regles qui peuvent differer des circuits ATP/WTA. Le coaching off-court (depuis les tribunes) est generalement tolere.

### Penalite pour coaching illegal

Premier avertissement pour le coach, puis penalite pour le joueur si repetition.`,
    summary: 'Regles de coaching qui varient selon les tournois et circuits',
    tags: ['conduite', 'coaching', 'communication', 'coach', 'tribunes'],
    keywords: 'coaching coach communication conseils tribunes changement cote',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'advanced',
  },

  // =============================================
  // REPOS ET TEMPS
  // =============================================
  {
    sport: 'tennis',
    category_id: 'rest',
    category_name: 'Repos et Temps',
    category_order: 9,
    title: 'Temps de Jeu et Pauses',
    slug: 'temps-jeu-pauses',
    content: `## Gestion du temps pendant un match

### Entre les points

- Maximum **25 secondes** entre la fin d'un point et le service suivant
- Chronometre visible sur les courts principaux (shot clock)
- Premiere violation : avertissement ; puis point de penalite

### Changement de cote

- **90 secondes** de pause lors du changement de cote (jeux impairs)
- Pas de pause apres le 1er jeu de chaque set
- Le temps commence quand le dernier point est termine

### Entre les sets

- **120 secondes** (2 minutes) entre les sets
- Temps pour s'hydrater, se changer, consulter le coach

### Echauffement

- **5 minutes** d'echauffement avant le match (generalement)
- Peut varier selon les tournois

### Temps morts

Certains formats permettent un temps mort par set demande par le joueur.`,
    summary: '25s entre points, 90s changement de cote, 2min entre sets',
    tags: ['temps', 'pause', 'changement', 'repos', 'shot-clock'],
    keywords: 'temps pause changement cote entre points sets shot clock',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
  },
  {
    sport: 'tennis',
    category_id: 'rest',
    category_name: 'Repos et Temps',
    category_order: 9,
    title: 'Pauses Medicales et Toilettes',
    slug: 'pauses-medicales-toilettes',
    content: `## Pauses speciales

### Pause medicale (Medical Time-Out)

- Un joueur peut demander une **evaluation medicale**
- Duree : 3 minutes pour evaluation + traitement
- Une seule pause par probleme medical
- Le medecin decide si le joueur peut continuer

### Blessures

- Si le joueur ne peut plus jouer, il doit abandonner
- Les traitements en cours de match sont limites
- Certaines blessures permettent un strapping rapide

### Pause toilettes

- Generalement une pause toilettes autorisee par match
- Duree raisonnable (environ 3-5 minutes)
- A prendre entre les sets de preference
- Abus sanctionne par avertissement

### Changement de tenue

- Autorise pour des raisons pratiques (vetements mouilles, dechires)
- Doit se faire rapidement
- En cas de pluie, les joueurs peuvent mettre des vetements chauds

### Conditions meteorologiques

- L'arbitre peut suspendre le match (pluie, chaleur extreme)
- Regles de chaleur extreme dans certains tournois (pause de 10 min)`,
    summary: 'Pause medicale 3 min, pause toilettes entre sets, regles meteo',
    tags: ['pause', 'medical', 'toilettes', 'blessure', 'chaleur'],
    keywords: 'pause medicale toilettes blessure chaleur meteo pluie',
    source: 'ITF Rules of Tennis 2025',
    difficulty: 'intermediate',
  },
  {
    sport: 'tennis',
    category_id: 'rest',
    category_name: 'Repos et Temps',
    category_order: 9,
    title: 'Repos Entre les Matchs',
    slug: 'repos-entre-matchs',
    content: `## Temps de repos entre les parties

### Regles FFT (competitions francaises)

Les delais de repos minimum entre les matchs sont :

**Entre 2 simples**
- Seniors : 1h30 minimum
- Categories jeunes (12 ans et +) : 3 heures minimum
- Seniors+ : 3 heures minimum

**Entre un simple et un double (ou 2 doubles)**
- 30 minutes minimum pour toutes les categories

**Entre deux journees**
- 12 heures de repos minimum
- Aucune partie avant 7 heures du matin
- Aucune partie ne peut commencer apres minuit

### En tournoi professionnel

- Les joueurs n'ont generalement pas de match le lendemain d'un 5e set
- Night sessions : les matchs peuvent terminer tres tard
- Programmation tenant compte de la recuperation

### Importance

Ces regles visent a :
- Proteger la sante des joueurs
- Garantir l'equite sportive
- Permettre une recuperation adequate`,
    summary: '1h30 entre simples seniors, 3h pour jeunes, 30min avant double',
    tags: ['repos', 'match', 'recuperation', 'programmation'],
    keywords: 'repos match entre parties heures recuperation programmation',
    source: 'FFT Reglements Sportifs 2025',
    difficulty: 'advanced',
  },
];

async function seedTennisRules() {
  console.log('🎾 Starting Tennis Rules seeding...\n');

  // Check if rules already exist
  const { data: existing, error: checkError } = await supabase
    .from('sport_rules')
    .select('id')
    .eq('sport', 'tennis')
    .limit(1);

  if (checkError) {
    console.error('❌ Error checking existing rules:', checkError.message);
    console.log('\n💡 Make sure to run the migration first:');
    console.log('   supabase db push');
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.log('⚠️  Tennis rules already exist. Deleting and re-seeding...\n');
    const { error: deleteError } = await supabase
      .from('sport_rules')
      .delete()
      .eq('sport', 'tennis');

    if (deleteError) {
      console.error('❌ Error deleting existing rules:', deleteError.message);
      process.exit(1);
    }
    console.log('✓ Existing rules deleted\n');
  }

  // Insert rules
  let successCount = 0;
  let errorCount = 0;

  for (const rule of tennisRules) {
    const { error } = await supabase.from('sport_rules').insert(rule);

    if (error) {
      console.error(`❌ Error inserting "${rule.title}":`, error.message);
      errorCount++;
    } else {
      console.log(`✓ Added: ${rule.title} (${rule.category_name})`);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`🎾 Tennis Rules seeding complete!`);
  console.log(`   ✓ ${successCount} rules added`);
  if (errorCount > 0) {
    console.log(`   ❌ ${errorCount} errors`);
  }
  console.log('='.repeat(50));
}

// Run the seeding
seedTennisRules().catch(console.error);
