/**
 * TournamentManage - Page de gestion des résultats du tournoi
 * Interface de gestion compacte et intuitive
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTournamentByCode, updateMatchResult, undoLastMatchResult } from '../../services/anonymousTournamentService'
import MatchCard from '../../components/tournament/MatchCard'
import BracketDisplay from '../../components/tournament/BracketDisplay'
import './TournamentManage.css'

const TournamentManage = () => {
  const { code } = useParams()
  const [tournament, setTournament] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeRound, setActiveRound] = useState(1)

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

  const handleMatchWinner = async (matchId, winner) => {
    // Trouver le match et mettre à jour
    const result = {
      match_id: matchId,
      winner: winner,
      timestamp: new Date().toISOString(),
    }

    const { data, error } = await updateMatchResult(tournament.id, result)

    if (error) {
      alert(`Erreur: ${error}`)
    } else {
      // Recharger le tournoi pour voir les changements
      await loadTournament()
    }
  }

  const handleUndo = async (matchId) => {
    const { data, error } = await undoLastMatchResult(tournament.id)

    if (error) {
      alert(`Erreur: ${error}`)
    } else {
      await loadTournament()
    }
  }

  if (isLoading) {
    return (
      <div className="tournament-manage-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du tournoi...</p>
        </div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="tournament-manage-page">
        <div className="error-container">
          <h1>Tournoi introuvable</h1>
          <p>{error}</p>
          <Link to="/tournament/create" className="btn-primary-large">
            Créer un nouveau tournoi
          </Link>
        </div>
      </div>
    )
  }

  // Extraire les matchs selon le format
  const matches = tournament.format === 'single_elimination'
    ? tournament.bracket_data.rounds?.flatMap(r => r.matches) || []
    : tournament.format === 'round_robin' || tournament.format === 'swiss'
      ? tournament.bracket_data.rounds?.flatMap(r => r.matches) || []
      : []

  const currentRoundMatches = tournament.bracket_data.rounds?.[activeRound - 1]?.matches || []

  return (
    <div className="tournament-manage-page">
      <header className="manage-header">
        <div className="header-top">
          <Link to={`/tournament/${code}`} className="back-link">
            Retour au tableau
          </Link>
          <h1>{tournament.name}</h1>
        </div>
        <p className="manage-subtitle">
          Gérez les résultats des matchs et suivez la progression du tournoi.
        </p>
      </header>

      <div className="manage-content">
        {/* Sélection du tour */}
        {tournament.bracket_data.rounds && tournament.bracket_data.rounds.length > 1 && (
          <div className="round-selector" role="tablist" aria-label="Sélection du tour">
            <h3>Sélectionner un tour:</h3>
            <div className="round-buttons">
              {tournament.bracket_data.rounds.map((round, index) => (
                <button
                  key={round.round}
                  className={`round-btn ${activeRound === round.round ? 'active' : ''}`}
                  onClick={() => setActiveRound(round.round)}
                  role="tab"
                  aria-selected={activeRound === round.round}
                  aria-controls={`round-panel-${round.round}`}
                  id={`round-tab-${round.round}`}
                >
                  {round.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Matchs du tour actuel */}
        <div 
          className="matches-section"
          role="tabpanel"
          id={`round-panel-${activeRound}`}
          aria-labelledby={`round-tab-${activeRound}`}
        >
          <h2>Matchs en cours</h2>
          {currentRoundMatches.length > 0 ? (
            <div className="matches-grid">
              {currentRoundMatches
                .filter(match => match.player1 && match.player2)
                .map((match) => (
                  <MatchCard
                    key={match.match_id}
                    match={match}
                    onWinner={handleMatchWinner}
                    onUndo={handleUndo}
                    showUndo={true}
                  />
                ))}
            </div>
          ) : (
            <p className="no-matches-message">
              Aucun match disponible pour ce tour
            </p>
          )}
        </div>

        {/* Aperçu du bracket */}
        <div className="bracket-preview-section">
          <h2>Tableau du tournoi</h2>
          <div className="bracket-wrapper">
            <BracketDisplay
              bracket={tournament.bracket_data}
              format={tournament.format}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TournamentManage
