# Quick Start - Migration Rapide

Guide ultra-simplifié pour migrer en **5 étapes**.

---

## ⚡ Version Rapide (10 minutes)

### Étape 1: Backup
```sql
-- Créer une copie de sécurité
CREATE TABLE anonymous_tournaments_backup AS
SELECT * FROM anonymous_tournaments;
```

### Étape 2: Créer les tables
```sql
-- Copier le contenu de TOURNAMENTS_V2_SCHEMA.sql
-- Le coller dans Supabase SQL Editor
-- Cliquer sur "Run"
```

### Étape 3: Migrer les données
```sql
-- Copier la section "Migration automatique" de MIGRATION_TOURNAMENTS_V2.sql
-- Le coller dans Supabase SQL Editor
-- Cliquer sur "Run"
```

### Étape 4: Vérifier
```sql
SELECT
  (SELECT COUNT(*) FROM anonymous_tournaments) as ancien,
  (SELECT COUNT(*) FROM tournaments) as nouveau;
```

### Étape 5: Activer RLS
```sql
-- Copier la section RLS de TOURNAMENTS_V2_SCHEMA.sql (ligne 150+)
-- Le coller dans Supabase SQL Editor
-- Cliquer sur "Run"
```

---

## ✅ C'est fini !

Votre système de tournois V2 est maintenant opérationnel.

---

## 🧪 Test avec le Bouton de Test Login

1. **Accéder à la page de login**: http://localhost:5176/login

2. **Chercher le bouton violet en bas à droite**: 🧪 Test Login

3. **Cliquer sur le bouton**:
   - Si le compte existe: Connexion automatique
   - Si le compte n'existe pas: Création + connexion automatique

4. **Credentials du compte de test**:
   - Email: `test@multisport.com`
   - Password: `TestPassword123!`
   - Cliquez sur l'icône ℹ️ pour voir les credentials

---

## 📁 Fichiers Créés

### Bouton de Test Login
- `src/components/TestLoginButton.jsx` - Composant React
- `src/components/TestLoginButton.css` - Styles
- Intégré dans `src/pages/Login.jsx`

**Features**:
- ✅ Visible uniquement en développement
- ✅ Création automatique du compte si inexistant
- ✅ Affichage des credentials
- ✅ Gestion d'erreurs

### Guide de Migration
- `MANUAL_MIGRATION_GUIDE.md` - Guide détaillé complet (3000+ mots)
- `QUICK_START_MIGRATION.md` - Ce fichier (version rapide)

---

## 🎯 Prochaines Étapes

1. **Créer un tournoi test**:
   - Allez sur `/dashboard/tournaments`
   - Cliquez "Créer un tournoi"
   - Remplissez le formulaire
   - Testez les 4 formats

2. **Tester les fonctionnalités Sprint 1-4**:
   - ✅ Génération de brackets
   - ✅ Mise à jour des matchs
   - ✅ Export PDF
   - ✅ QR Code et partage
   - ✅ Mode sombre
   - ✅ Temps réel

---

## 🔧 Troubleshooting

### Le bouton ne s'affiche pas
**Solution**: Le bouton est masqué en production. Vérifiez que vous êtes bien en mode développement:
```bash
# Vérifier le mode
echo $NODE_ENV

# Lancer en dev
npm run dev
```

### Erreur de connexion
**Solution**: Vérifiez votre configuration Supabase:
```bash
# multi-sport-competition/.env
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Table inexistante
**Solution**: Exécutez le script de migration:
```sql
-- Voir MANUAL_MIGRATION_GUIDE.md
-- Ou MIGRATION_TOURNAMENTS_V2.sql
```

---

## 📚 Documentation Complète

Pour plus de détails:
- **Migration détaillée**: `MANUAL_MIGRATION_GUIDE.md`
- **Implémentation**: `TOURNAMENTS_V2_IMPLEMENTATION_GUIDE.md`
- **Guide utilisateur**: `USER_GUIDE.md`
- **Déploiement**: `DEPLOYMENT_GUIDE.md`
- **Sprints 1-4**: `SPRINT_1_RECAP.md` à `SPRINT_4_RECAP.md`

---

**Besoin d'aide?**
- GitHub Issues: [Créer une issue]
- Email: support@yourdomain.com

---

**Version**: 2.0.0
**Date**: Janvier 2025
