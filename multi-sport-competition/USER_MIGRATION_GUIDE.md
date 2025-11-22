# Guide de Migration - Architecture Unifiée des Tournois (v2.0.0)

Ce guide explique les changements majeurs introduits dans la version 2.0.0 et comment naviguer dans la nouvelle interface unifiée.

## 🔄 Ce qui change

### 1. Tableau de Bord Unifié
Auparavant, la gestion des tournois était dispersée entre "Mes Tournois", "Compétitions" et des liens directs.
**Maintenant, TOUT se trouve dans le Dashboard > Tournois.**

- **Ancienne route:** `/dashboard/competitions` ou `/dashboard/my-tournaments`
- **Nouvelle route:** `/dashboard/tournaments`

### 2. Création de Tournoi Simplifiée
Il n'y a plus de distinction entre "Tournoi Rapide" (anonyme) et "Compétition" (officielle).
Utilisez le bouton **"➕ Créer un tournoi"** pour lancer l'assistant unique qui gère tous les cas.

- **Format:** Choisissez parmi Élimination Simple, Double, Round-Robin ou Suisse.
- **Visibilité:** Tous les tournois sont publics par défaut mais gérés depuis votre compte.

### 3. Gestion des Matchs
L'interface de gestion de bracket a été intégrée directement dans le détail du tournoi.
Cliquez sur un tournoi dans votre liste pour accéder à :
- L'arbre de tournoi (Bracket)
- La liste des participants
- Les paramètres

## 🔗 Redirections Automatiques

Les anciens liens ont été préservés et redirigent automatiquement vers les nouvelles pages :

| Ancien Lien | Redirige vers |
|-------------|---------------|
| `/tournament/create` | `/dashboard/tournaments/create` |
| `/tournament/:code` | `/dashboard/tournaments` |
| `/competition/:id` | `/dashboard/tournaments` |

## ❓ FAQ

**Q: Où sont passés mes anciens tournois ?**
R: Tous vos tournois (rapides et compétitions) ont été migrés et sont visibles dans l'onglet "Tournois" du dashboard.

**Q: Puis-je encore créer un tournoi sans compte ?**
R: Non, pour des raisons de sécurité et de gestion, un compte est maintenant requis pour créer un tournoi. L'inscription est gratuite.

**Q: Comment changer le format d'un tournoi existant ?**
R: Le format est fixé à la création pour garantir l'intégrité du bracket. Vous devez créer un nouveau tournoi pour changer de format.
