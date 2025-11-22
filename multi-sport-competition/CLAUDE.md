# CLAUDE.md - Developer Guide

## 🏗 Architecture Unifiée (v2.0.0)

L'application utilise une architecture unifiée pour la gestion des tournois, remplaçant l'ancien système double (Competitions vs Anonymous Tournaments).

### Core Components
- **Service:** `src/services/tournamentService.unified.js` (Single Source of Truth)
- **Database:** Table `tournaments` (PostgreSQL + RLS)
- **State Management:** React Query (`@tanstack/react-query`)
- **Routing:** `/dashboard/tournaments/*` (Protected Routes)

### Structure des Dossiers
```
src/
├── services/
│   └── tournamentService.unified.js  # CRUD, Bracket logic, Files
├── pages/
│   └── dashboard/
│       └── tournaments/
│           ├── TournamentList.jsx    # Liste avec filtres & recherche
│           └── TournamentList.css
├── components/
│   └── tournament/
│       ├── TournamentWizard.jsx      # Création (Wizard pattern)
│       ├── TournamentDashboard.jsx   # Vue détaillée & Gestion
│       └── BracketDisplay.jsx        # Visualisation arbre
```

## 🛠 Commandes Utiles

### Development
```bash
npm run dev          # Démarrer le serveur local
npm run build        # Build pour production
npm run preview      # Prévisualiser le build
```

### Database (Supabase)
```bash
# Les migrations sont dans le dossier racine
DATABASE_MIGRATION_UNIFIED.sql  # Schema structure
DATABASE_MIGRATION_DATA.sql     # Data migration
```

## 🧪 Testing
- **Unit Tests:** `npm run test` (Vitest)
- **E2E:** Manuels pour l'instant (voir `IMPLEMENTATION_REVIEW.md`)

## 📝 Conventions
- **Formats:** Utiliser des tirets (`single-elimination`, `round-robin`)
- **Imports:** Toujours utiliser `tournamentService.unified`
- **Styling:** CSS Modules ou fichiers .css dédiés (pas de Tailwind pour l'instant)
