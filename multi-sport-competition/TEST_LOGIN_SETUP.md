# Configuration du Bouton Test Login

Guide pour résoudre l'erreur **"Email not confirmed"** avec le bouton de test.

---

## 🔧 Solution 1: Confirmer l'email manuellement (Recommandé)

### Étape par étape

1. **Ouvrir Supabase Dashboard**
   - URL: https://app.supabase.com
   - Se connecter avec votre compte

2. **Naviguer vers Authentication**
   ```
   Sidebar → Authentication → Users
   ```

3. **Trouver l'utilisateur test**
   - Chercher dans la liste: `test@multisport.com`
   - Ou utiliser la barre de recherche

4. **Confirmer l'email**
   - Cliquer sur le menu (⋮) à droite de l'utilisateur
   - Sélectionner **"Confirm email"**
   - Confirmer l'action

5. **Retourner à votre application**
   - Rafraîchir la page de login
   - Recliquer sur le bouton 🧪 Test Login
   - ✅ Connexion réussie!

---

## 🔓 Solution 2: Désactiver la confirmation d'email (Développement seulement)

### ⚠️ Avertissement
Cette méthode désactive la confirmation d'email pour **TOUS** les nouveaux utilisateurs de votre projet Supabase. À utiliser uniquement en développement!

### Étape par étape

1. **Ouvrir Supabase Dashboard**
   - Aller sur votre projet

2. **Naviguer vers Authentication Providers**
   ```
   Sidebar → Authentication → Providers
   ```

3. **Configurer Email Provider**
   - Trouver **"Email"** dans la liste des providers
   - Cliquer sur **"Email"** pour ouvrir les settings

4. **Désactiver la confirmation**
   - Décocher l'option **"Confirm email"**
   - Cliquer sur **"Save"**

5. **Supprimer l'ancien compte (optionnel)**
   ```
   Authentication → Users → test@multisport.com → Delete
   ```

6. **Recréer le compte**
   - Retourner sur http://localhost:5176/login
   - Cliquer sur 🧪 Test Login
   - ✅ Le compte est créé sans confirmation!

---

## 🎯 Solution 3: Utiliser un email réel (Alternative)

Si vous préférez utiliser un vrai email:

### Modifier les credentials

1. **Ouvrir le fichier**
   ```
   src/components/TestLoginButton.jsx
   ```

2. **Changer l'email (ligne 17-20)**
   ```javascript
   const TEST_CREDENTIALS = {
     email: 'votre-vrai-email@gmail.com',  // ← Changez ici
     password: 'TestPassword123!'
   }
   ```

3. **Sauvegarder le fichier**
   - Hot reload automatique

4. **Cliquer sur Test Login**
   - Vous recevrez un email de confirmation
   - Cliquer sur le lien dans l'email
   - Retourner sur la page et vous connecter

---

## 🐛 Troubleshooting

### "User already registered"

**Cause**: Le compte existe déjà avec l'email non confirmé

**Solution**:
- Suivre **Solution 1** (confirmer manuellement)
- Ou supprimer le compte et réessayer

### "Invalid login credentials"

**Cause**: Mauvais email/password

**Solution**:
- Vérifier les credentials dans `TestLoginButton.jsx`
- Par défaut: `test@multisport.com` / `TestPassword123!`

### "Rate limit exceeded"

**Cause**: Trop de tentatives de connexion

**Solution**:
- Attendre 1 minute
- Réessayer

### Le bouton ne s'affiche pas

**Cause**: Mode production activé

**Solution**:
```bash
# Vérifier que vous êtes en mode dev
npm run dev

# Le bouton n'apparaît QUE en mode développement
```

---

## 📋 Checklist de Configuration

Pour un setup optimal:

- [ ] Supabase project créé
- [ ] `.env` configuré avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
- [ ] Email confirmation désactivée (dev) OU email confirmé manuellement
- [ ] Serveur dev lancé: `npm run dev`
- [ ] Page login ouverte: http://localhost:5176/login
- [ ] Bouton 🧪 Test Login visible en bas à droite

---

## 🎓 Comprendre le Problème

### Pourquoi cette erreur?

Supabase Auth exige par défaut une **confirmation d'email** pour des raisons de sécurité:
- Vérifie que l'email est valide
- Évite les inscriptions frauduleuses
- Protège contre le spam

### Pourquoi un compte de test?

En développement, créer/confirmer des comptes manuellement est fastidieux:
- ❌ Créer un compte à chaque fois
- ❌ Vérifier l'email à chaque fois
- ❌ Se souvenir du mot de passe

Le bouton de test:
- ✅ Connexion en 1 clic
- ✅ Credentials fixes et visibles
- ✅ Auto-création du compte
- ✅ Masqué en production

---

## 🔒 Sécurité

### Production

Le bouton de test est **automatiquement masqué** en production grâce à:

```javascript
if (import.meta.env.PROD) {
  return null
}
```

### Ne jamais faire en production

❌ Désactiver la confirmation d'email
❌ Utiliser des credentials hardcodés
❌ Laisser le bouton de test visible

### Recommandations

✅ Réactiver la confirmation d'email avant déploiement
✅ Utiliser des variables d'environnement
✅ Supprimer le compte de test en production

---

## 📚 Ressources

- **Documentation Supabase Auth**: https://supabase.com/docs/guides/auth
- **Email Templates**: https://supabase.com/docs/guides/auth/auth-email-templates
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security

---

## 💡 Astuce Pro

Pour un workflow encore plus rapide:

1. **Créer un profile Supabase "Dev"**
   - Projet séparé pour développement
   - Email confirmation désactivée
   - RLS policies plus permissives

2. **Utiliser deux projets**
   - **Dev**: `VITE_SUPABASE_URL_DEV`
   - **Prod**: `VITE_SUPABASE_URL_PROD`

3. **Script de switch**
   ```bash
   # package.json
   "dev": "cp .env.dev .env && vite"
   "prod": "cp .env.prod .env && vite build"
   ```

---

**Besoin d'aide?**
- Issues GitHub: [Créer une issue]
- Email: support@yourdomain.com

---

**Version**: 2.0.0
**Date**: Janvier 2025
