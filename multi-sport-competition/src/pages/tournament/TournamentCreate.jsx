/**
 * TournamentCreate - Page de création de tournoi anonyme
 * Utilise le TournamentWizard pour guider l'utilisateur
 */

import { Link } from 'react-router-dom'
import TournamentWizard from '../../components/tournament/TournamentWizard'
import './TournamentCreate.css'

const TournamentCreate = () => {
  return (
    <div className="tournament-create-page">
      <header className="create-header">
        <Link to="/" className="back-link">
          ← Retour à l'accueil
        </Link>
        <h1>Créer un Tournoi de Tennis</h1>
        <p className="header-subtitle">
          Créez votre tournoi en quelques étapes simples. Aucun compte nécessaire!
        </p>
      </header>

      <main className="create-content">
        <TournamentWizard />
      </main>

      <footer className="create-footer">
        <p>💡 Astuce: Vous recevrez un lien unique pour gérer et partager votre tournoi</p>
      </footer>
    </div>
  )
}

export default TournamentCreate
