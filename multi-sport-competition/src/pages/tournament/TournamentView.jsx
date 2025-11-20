/**
 * TournamentView - Page de visualisation publique d'un tournoi
 * Accessible via lien unique sans authentification
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTournamentByCode } from '../../services/anonymousTournamentService'
import BracketDisplay from '../../components/tournament/BracketDisplay'
import './TournamentView.css'

const TournamentView = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    loadTournament()
  }, [code])

  const loadTournament = async () => {
    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await getTournamentByCode(code)

    if (fetchError) {
      setError(fetchError)
    } else {
      setTournament(data)
    }

    setIsLoading(false)
  }

  const copyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('✓ Lien copié dans le presse-papiers!')
      })
      .catch(() => {
        alert('Erreur lors de la copie du lien')
      })
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="tournament-view-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du tournoi...</p>
        </div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="tournament-view-page">
        <div className="error-container">
          <h1>Tournoi introuvable</h1>
          <p>Ce tournoi n'existe pas ou a expiré.</p>
          <Link to="/tournament/create" className="btn-primary-large">
            Créer un nouveau tournoi
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="tournament-view-page">
      <header className="tournament-header">
        <div className="header-content">
          <h1>{tournament.name}</h1>
          {tournament.location && (
            <p className="tournament-location">📍 {tournament.location}</p>
          )}
          {tournament.tournament_date && (
            <p className="tournament-date">
              📅 {new Date(tournament.tournament_date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
          <div className="tournament-meta">
            <span className="meta-item">
              {tournament.players_count} joueurs
            </span>
            <span className="meta-item">
              {tournament.format === 'single_elimination' && 'Élimination Simple'}
              {tournament.format === 'double_elimination' && 'Double Élimination'}
              {tournament.format === 'round_robin' && 'Round-Robin'}
              {tournament.format === 'swiss' && 'Système Suisse'}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-action" onClick={handlePrint}>
            🖨️ Imprimer
          </button>
          <button className="btn-action" onClick={copyLink}>
            🔗 Copier le lien
          </button>
          <Link
            to={`/tournament/${code}/manage`}
            className="btn-action btn-manage"
          >
            ⚙️ Gérer les résultats
          </Link>
        </div>
      </header>

      <main className="tournament-content">
        <BracketDisplay
          bracket={tournament.bracket_data}
          format={tournament.format}
        />
      </main>

      <footer className="tournament-footer">
        <p>
          Créé avec <span style={{ color: '#FF9500' }}>❤️</span> pour les tournois de tennis
        </p>
        <Link to="/tournament/create" className="footer-link">
          Créer mon propre tournoi
        </Link>
      </footer>
    </div>
  )
}

export default TournamentView
