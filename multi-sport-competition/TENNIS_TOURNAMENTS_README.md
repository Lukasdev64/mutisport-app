# Système de Tournois de Tennis pour Seniors

Interface de gestion de tournois de tennis conçue spécifiquement pour les seniors (60+). Création et gestion de tournois **totalement anonyme** sans besoin de compte.

## 🎯 Caractéristiques Principales

### Pour les Organisateurs
- ✅ **Création anonyme** - Aucun compte requis
- ✅ **Interface guidée** - Wizard en 5 étapes simples
- ✅ **4 formats de tournoi** - Élimination simple, double élimination, round-robin, système suisse
- ✅ **Gestion des résultats** - Interface no-code avec gros boutons tactiles
- ✅ **Impression PDF** - Export pour affichage au club
- ✅ **Partage par lien** - URL unique pour partager le tournoi

### Design Senior-Friendly
- 📱 **Boutons extra-larges** (72×72px minimum)
- 🔤 **Police grande taille** (18px+ pour le texte)
- 🎨 **Contraste élevé** (Orange #FF9500 sur blanc)
- 👆 **Tactile optimisé** - Interface tablette/iPad
- ♿ **Accessible** - Navigation au clavier, screen readers

## 🚀 Mise en Route

### 1. Configuration de la Base de Données

Exécutez le script SQL dans Supabase:

```bash
# Dans le SQL Editor de Supabase
cat ANONYMOUS_TOURNAMENTS_SETUP.sql
```

Ce script crée:
- Table `anonymous_tournaments` avec RLS
- Fonction de génération de codes uniques
- Triggers pour updated_at
- Fonction de nettoyage automatique

### 2. Routes Disponibles

```
/tournament/create          → Créer un nouveau tournoi
/tournament/:code           → Voir un tournoi (public)
/tournament/:code/manage    → Gérer les résultats (public)
```

### 3. Utilisation

#### Créer un Tournoi

1. Allez sur `/tournament/create`
2. Suivez le wizard en 5 étapes:
   - **Étape 1**: Nom, lieu, date
   - **Étape 2**: Format (élimination simple recommandé)
   - **Étape 3**: Nombre de joueurs et noms
   - **Étape 4**: Vérification
   - **Étape 5**: Création et génération du lien

3. Recevez un lien unique: `/tournament/a7x9m2k5`

#### Partager le Tournoi

- Copiez le lien depuis la page du tournoi
- Partagez par email, SMS, ou imprimez le QR code
- Toute personne avec le lien peut voir le bracket
- Le lien `/manage` permet de mettre à jour les résultats

#### Mettre à Jour les Résultats

1. Allez sur `/tournament/:code/manage`
2. Sélectionnez le tour actif
3. Cliquez sur le bouton "Gagne" du vainqueur de chaque match
4. Le bracket se met à jour automatiquement
5. Utilisez "Annuler" pour corriger une erreur

## 📋 Architecture

### Structure des Fichiers

```
src/
├── services/
│   └── anonymousTournamentService.js    # CRUD pour tournois
├── utils/
│   └── bracketAlgorithms.js             # Génération des brackets
├── components/tournament/
│   ├── TournamentWizard.jsx             # Wizard 5 étapes
│   ├── FormatSelector.jsx               # Sélection format
│   ├── BracketDisplay.jsx               # Affichage bracket
│   └── MatchCard.jsx                    # Carte de match
└── pages/tournament/
    ├── TournamentCreate.jsx             # Page création
    ├── TournamentView.jsx               # Page visualisation
    └── TournamentManage.jsx             # Page gestion
```

### Formats de Tournoi Supportés

#### 1. Élimination Simple (Recommandé)
- Une défaite = élimination
- Nombre de matchs: N - 1 (où N = nombre de joueurs)
- Parfait pour: 4-32 joueurs
- Durée estimée: La plus courte

#### 2. Double Élimination
- Deux défaites nécessaires pour élimination
- Winner bracket + Loser bracket
- Nombre de matchs: 2N - 2
- Parfait pour: Donner une seconde chance

#### 3. Round-Robin (Poules)
- Chaque joueur affronte tous les autres
- Nombre de matchs: N × (N-1) / 2
- Parfait pour: 4-8 joueurs, maximiser les matchs
- Classement au nombre de victoires

#### 4. Système Suisse
- Appariements dynamiques selon les résultats
- Joueurs de même niveau s'affrontent
- Nombre de tours: log₂(N) arrondi
- Parfait pour: Grands tournois (16-64 joueurs)

## 🎨 Design Tokens

### Couleurs

```css
/* Actions primaires */
--orange: #FF9500;      /* Boutons principaux */
--blue: #003366;        /* Éléments secondaires */
--green: #28A745;       /* Succès/Victoire */
--red: #DC3545;         /* Erreur/Annulation */

/* Texte */
--text-primary: #000000;
--text-secondary: #666666;
--text-muted: #999999;

/* Backgrounds */
--bg-white: #FFFFFF;
--bg-light: #F5F5F5;
--bg-lighter: #E0E0E0;
```

### Typographie

```css
/* Corps de texte */
font-size: 18px;
line-height: 1.6;

/* Titres */
h1: 32-48px;
h2: 28-32px;
h3: 22-24px;

/* Boutons */
font-size: 20-24px;
font-weight: 700;
```

### Tailles des Composants

```css
/* Boutons principaux */
min-height: 72px;
padding: 1.25rem 2rem;

/* Boutons d'action */
min-height: 60px;
padding: 1rem 1.5rem;

/* Input fields */
min-height: 56px;
padding: 1rem 1.5rem;
```

## 🔒 Sécurité et Vie Privée

### Données Stockées
- ❌ **Aucune donnée personnelle** (email, téléphone, adresse)
- ✅ Nom du tournoi
- ✅ Noms des joueurs (optionnel, peut être "Joueur 1", "Joueur 2"...)
- ✅ Résultats des matchs
- ✅ Métadonnées (date de création, vues)

### Accès
- 🔓 **Pas d'authentification** - Accès via lien unique uniquement
- ⚠️ **Sécurité par obscurité** - Code URL aléatoire de 8 caractères
- 🗑️ **Auto-suppression** - Tournois supprimés après 30 jours

### Row Level Security (RLS)
- ✅ Lecture publique (tout le monde peut voir)
- ✅ Écriture publique (tout le monde peut créer/modifier)
- ⚠️ Pas de protection par utilisateur (design volontaire pour simplicité)

## 📊 Performance

### Optimisations
- React avec hooks modernes
- Pas de re-renders inutiles
- CSS minimal, pas de framework lourd
- Images optimisées (emojis natifs)

### Limitations
- Max 128 joueurs par tournoi
- Max 64 joueurs recommandé pour UX optimale
- Tournois expirés après 30 jours d'inactivité

## 🧪 Testing

### Scénarios de Test

1. **Création de tournoi**
   - Tester les 4 formats
   - Tester avec 4, 8, 16, 32 joueurs
   - Tester avec/sans noms personnalisés

2. **Mise à jour des résultats**
   - Cliquer "Gagne" sur plusieurs matchs
   - Tester la fonction "Annuler"
   - Vérifier la mise à jour du bracket

3. **Partage**
   - Copier le lien
   - Ouvrir dans nouvel onglet
   - Vérifier l'accès en mode incognito

4. **Impression**
   - Tester l'impression (Ctrl+P)
   - Vérifier la mise en page PDF

### Tests avec Seniors

⚠️ **Important**: Testez avec de vrais seniors avant le lancement!

Points à vérifier:
- [ ] Peuvent-ils naviguer sans aide?
- [ ] Comprennent-ils les icônes et labels?
- [ ] Arrivent-ils à cliquer sur les boutons?
- [ ] La taille du texte est-elle suffisante?
- [ ] Besoin d'une aide/tutorial?

## 🔄 Maintenance

### Nettoyage Automatique

Configurez un cron job Supabase (via Edge Functions ou pg_cron):

```sql
-- Exécuter tous les jours à minuit
SELECT cron.schedule(
  'cleanup-expired-tournaments',
  '0 0 * * *',
  'SELECT cleanup_expired_tournaments()'
);
```

### Monitoring

Métriques à surveiller:
- Nombre de tournois créés par jour
- Nombre de vues par tournoi
- Taux d'abandon dans le wizard
- Formats de tournoi les plus populaires

## 🚧 Améliorations Futures

### Court Terme
- [ ] Export PDF avec QR code
- [ ] Notifications par email (optionnel)
- [ ] Thème sombre
- [ ] Support multi-langue

### Moyen Terme
- [ ] Gestion des horaires de matchs
- [ ] Attribution des courts
- [ ] Statistiques par joueur
- [ ] Historique des tournois passés

### Long Terme
- [ ] Application mobile native
- [ ] Mode hors-ligne
- [ ] Intégration calendrier
- [ ] Système de classement

## 📞 Support

Pour toute question ou problème:
1. Consultez d'abord ce README
2. Vérifiez que la table Supabase est bien créée
3. Vérifiez les logs dans la console du navigateur
4. Testez sur un autre navigateur

## 📄 Licence

Ce système est intégré au projet Multi-Sport Competition sous la même licence.

---

**Version**: 1.0.0
**Date**: Novembre 2025
**Auteur**: Équipe Multi-Sport Competition
