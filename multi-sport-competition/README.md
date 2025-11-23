# 🏆 Multi-Sport Competition Manager

Une application web moderne pour la gestion de compétitions sportives multi-disciplinaires.

## 🚀 Technologies

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Langage**: JavaScript (ESModules)
- **Styling**: CSS Variables (Dark Theme System)
- **Backend / Auth / DB**: [Supabase](https://supabase.com/)
- **Paiements**: [Stripe](https://stripe.com/) (via Supabase Edge Functions)
- **Icônes**: [Lucide React](https://lucide.dev/)

## 🛠️ Prérequis

- [Node.js](https://nodejs.org/) (v18+)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (pour le développement backend local)

## 📥 Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Lukasdev64/mutisport-app.git
   cd mutisport-app/multi-sport-competition
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   Créez un fichier `.env` à la racine du projet (basé sur `.env.example` mais avec les clés Supabase) :
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:5173`.

## 📂 Structure du Projet

```
src/
├── assets/          # Images et ressources statiques
├── components/      # Composants React réutilisables (Header, Sidebar, etc.)
├── lib/             # Configuration des bibliothèques (supabase.js)
├── pages/           # Pages principales (Dashboard, Login, Register, etc.)
├── services/        # Logique métier et appels API
├── utils/           # Fonctions utilitaires
├── App.jsx          # Composant racine et routing
├── index.css        # Styles globaux et variables CSS (Thème Sombre)
└── main.jsx         # Point d'entrée de l'application
```

## 🎨 Système de Design

Le projet utilise un système de variables CSS pour assurer une cohérence visuelle (Thème Sombre).

**Fichiers clés :**
- `src/index.css` : Définition des variables (`--bg-primary`, `--accent-blue`, etc.) et styles globaux.
- `src/pages/Dashboard.css` : Styles spécifiques au tableau de bord utilisant les variables.
- `src/pages/Auth.css` : Styles partagés pour les pages de connexion/inscription.

**Règles de contribution CSS :**
- Ne jamais utiliser de couleurs hexadécimales en dur (ex: `#1e293b`). Utilisez toujours les variables (ex: `var(--bg-secondary)`).
- Privilégiez les classes CSS aux styles en ligne.

## ⚡ Scripts Disponibles

- `npm run dev` : Lance le serveur de développement.
- `npm run build` : Compile l'application pour la production.
- `npm run lint` : Vérifie la qualité du code avec ESLint.
- `npm run preview` : Prévisualise la version de production localement.

## ☁️ Backend (Supabase)

Le backend est géré par Supabase. Les fonctions Edge (pour Stripe, etc.) se trouvent dans le dossier `supabase/functions`.

Pour déployer les fonctions (nécessite Supabase CLI) :
```bash
npx supabase functions deploy nom-de-la-fonction --no-verify-jwt
```

## 🤝 Contribution

1. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-feature`).
2. Committez vos changements (`git commit -m 'Ajout de ma feature'`).
3. Poussez vers la branche (`git push origin feature/ma-feature`).
4. Ouvrez une Pull Request.

---
Développé par Lukasdev64
