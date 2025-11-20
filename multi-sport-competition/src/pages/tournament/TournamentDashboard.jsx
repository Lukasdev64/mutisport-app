import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiLayout, FiList, FiShare2, FiPrinter, FiSettings, FiRefreshCw } from 'react-icons/fi'
import { getTournamentByCode, updateMatchResult, undoLastMatchResult, generateNextRound } from '../../services/anonymousTournamentService'
import BracketDisplay from '../../components/tournament/BracketDisplay'
import MatchCard from '../../components/tournament/MatchCard'
import './TournamentDashboard.css'

const TournamentDashboard = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('matches') // 'matches' or 'bracket'
  const [activeRound, setActiveRound] = useState(1)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    loadTournament()
  }, [code])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const loadTournament = async () => {
    setIsLoading(true)
    setError(null)
    const { data, error: fetchError } = await getTournamentByCode(code)
    if (fetchError) {
      setError(fetchError)
    } else {
      // Check for round progression (simple check: if we have data and it's different)
      if (tournament && data.bracket_data.rounds.length > tournament.bracket_data.rounds.length) {
         // This logic is tricky because rounds array length might be fixed in some formats
      }
      
      // Check if a new round has matches that were empty before
      if (tournament && data.format === 'swiss') {
         const oldRounds = tournament.bracket_data.rounds
         const newRounds = data.bracket_data.rounds
         
         newRounds.forEach((round, index) => {
            if (round.matches.length > 0 && (!oldRounds[index] || oldRounds[index].matches.length === 0)) {
               setNotification({ type: 'info', message: `Le Tour ${round.round} est prêt !` })
               setActiveRound(round.round)
            }
         })
      }

      setTournament(data)
    }
    setIsLoading(false)
  }

  const handleMatchWinner = async (matchId, winner) => {
    const result = {
      match_id: matchId,
      winner: winner,
      timestamp: new Date().toISOString(),
    }
    const { error } = await updateMatchResult(tournament.id, result)
    if (error) {
      alert(`Erreur: ${error}`)
    } else {
      setNotification({ type: 'success', message: 'Résultat enregistré !' })
      await loadTournament()
    }
  }

  const handleUndo = async () => {
    const { error } = await undoLastMatchResult(tournament.id)
    if (error) {
      alert(`Erreur: ${error}`)
    } else {
      await loadTournament()
    }
  }

  const handleForceGenerate = async () => {
    if (!window.confirm('Voulez-vous forcer la génération du prochain tour ?')) return
    
    const { error } = await generateNextRound(tournament.id)
    if (error) {
      alert(`Erreur: ${error}`)
    } else {
      setNotification({ type: 'success', message: 'Tour suivant généré !' })
      await loadTournament()
    }
  }

  const copyPublicLink = () => {
    const url = `${window.location.origin}/tournament/${code}`
    navigator.clipboard.writeText(url)
      .then(() => alert('Lien public copié !'))
      .catch(() => alert('Erreur copie lien'))
  }

  if (isLoading) return <div className="loading-container"><div className="loading-spinner"></div></div>
  if (error) return <div className="error-container">{error}</div>
  if (!tournament) return null

  const currentRoundMatches = tournament.bracket_data.rounds?.[activeRound - 1]?.matches || []
  const isRoundComplete = currentRoundMatches.length > 0 && currentRoundMatches.every(m => m.winner)
  const hasNextRound = tournament.bracket_data.rounds?.[activeRound] // Next round exists
  const isNextRoundReady = hasNextRound && hasNextRound.matches && hasNextRound.matches.length > 0

  return (
    <div className="tournament-dashboard">
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === 'success' ? '✅' : 'ℹ️'} {notification.message}
        </div>
      )}

      {/* Header Compact */}
      <header className="td-header">
        <div className="td-title-section">
          <div className="td-badges">
            <span className={`status-badge ${tournament.status}`}>
              {tournament.status === 'in_progress' ? 'En cours' : tournament.status}
            </span>
            <span className="format-badge">
              {tournament.format.replace('_', ' ')}
            </span>
          </div>
          <h1>{tournament.name}</h1>
        </div>
        
        <div className="td-actions">
          <button className="btn-icon" onClick={copyPublicLink} title="Copier lien public">
            <FiShare2 />
          </button>
          <button className="btn-icon" onClick={() => window.print()} title="Imprimer">
            <FiPrinter />
          </button>
          <button className="btn-primary-sm" onClick={() => loadTournament()}>
            <FiRefreshCw /> Actualiser
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="td-tabs">
        <button 
          className={`td-tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <FiList /> Gestion des Matchs
        </button>
        <button 
          className={`td-tab ${activeTab === 'bracket' ? 'active' : ''}`}
          onClick={() => setActiveTab('bracket')}
        >
          <FiLayout /> Vue Tableau
        </button>
      </div>

      {/* Content Area */}
      <div className="td-content">
        {activeTab === 'matches' && (
          <div className="matches-view">
            {/* Round Selector */}
            {tournament.bracket_data.rounds?.length > 1 && (
              <div className="round-selector-compact">
                {tournament.bracket_data.rounds.map((round) => (
                  <button
                    key={round.round}
                    className={`round-pill ${activeRound === round.round ? 'active' : ''}`}
                    onClick={() => setActiveRound(round.round)}
                  >
                    {round.name}
                  </button>
                ))}
              </div>
            )}

            {/* Matches Grid */}
            {isRoundComplete && !isNextRoundReady && tournament.format === 'swiss' && (
               <div className="round-complete-banner">
                 <h3>🎉 Tour {activeRound} Terminé !</h3>
                 <p>Génération des prochains matchs en cours...</p>
                 <button 
                   className="btn-secondary-sm" 
                   style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white' }}
                   onClick={handleForceGenerate}
                 >
                   <FiRefreshCw /> Forcer la génération
                 </button>
               </div>
            )}
            
            {isRoundComplete && isNextRoundReady && (
               <div className="round-complete-banner" style={{ cursor: 'pointer' }} onClick={() => setActiveRound(activeRound + 1)}>
                 <h3>🚀 Le Tour {activeRound + 1} est prêt !</h3>
                 <p>Cliquez ici pour voir les nouveaux matchs</p>
               </div>
            )}

            <div className="matches-grid-compact">
              {currentRoundMatches.length > 0 ? (
                currentRoundMatches
                  .filter(m => m.player1 && m.player2)
                  .map(match => (
                    <MatchCard
                      key={match.match_id}
                      match={match}
                      onWinner={handleMatchWinner}
                      onUndo={handleUndo}
                      showUndo={true}
                      compact={true} // New prop for compact mode if needed
                    />
                  ))
              ) : (
                <div className="empty-round">
                  <p>Aucun match actif pour ce tour</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bracket' && (
          <div className="bracket-view-container">
            <BracketDisplay
              bracket={tournament.bracket_data}
              format={tournament.format}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default TournamentDashboard
