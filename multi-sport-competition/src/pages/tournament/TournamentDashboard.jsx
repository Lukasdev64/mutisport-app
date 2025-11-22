import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Layout, 
  List, 
  Share2, 
  Printer, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  Info,
  PlayCircle,
  RotateCcw
} from 'lucide-react'
import { getTournamentById, updateMatchResult, undoLastMatchResult, generateNextRound } from '../../services/tournamentService.unified'
import BracketDisplay from '../../components/tournament/BracketDisplay'
import MatchCard from '../../components/tournament/MatchCard'
import Skeleton from '../../components/common/Skeleton'
import './TournamentDashboard.css'

// MOCK DATA FOR TESTING
const MOCK_TOURNAMENTS = {
  // Valid UUIDs
  '11111111-1111-1111-1111-111111111111': {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Tournoi de Tennis Printemps',
    status: 'upcoming',
    format: 'single-elimination',
    code: 'TENNIS-2024',
    bracket_data: {
      rounds: [
        {
          round: 1,
          name: 'Quarts de finale',
          matches: [
            { match_id: 'm1', player1: 'Joueur 1', player2: 'Joueur 2', winner: null },
            { match_id: 'm2', player1: 'Joueur 3', player2: 'Joueur 4', winner: null },
            { match_id: 'm3', player1: 'Joueur 5', player2: 'Joueur 6', winner: null },
            { match_id: 'm4', player1: 'Joueur 7', player2: 'Joueur 8', winner: null }
          ]
        }
      ]
    }
  },
  '22222222-2222-2222-2222-222222222222': {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Championnat Basket 3x3',
    status: 'ongoing',
    format: 'double-elimination',
    code: 'BASKET-3X3',
    bracket_data: {
      rounds: [
        {
          round: 1,
          name: 'Round 1',
          matches: [
            { match_id: 'm1', player1: 'Team A', player2: 'Team B', winner: 'Team A' },
            { match_id: 'm2', player1: 'Team C', player2: 'Team D', winner: null }
          ]
        }
      ]
    }
  },
  '33333333-3333-3333-3333-333333333333': {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Ligue de Football Amateur',
    status: 'completed',
    format: 'round-robin',
    code: 'FOOT-LIGUE',
    bracket_data: {
      rounds: [
        {
          round: 1,
          name: 'Journée 1',
          matches: [
            { match_id: 'm1', player1: 'FC Rouge', player2: 'FC Bleu', winner: 'FC Rouge' },
            { match_id: 'm2', player1: 'FC Vert', player2: 'FC Jaune', winner: 'FC Jaune' }
          ]
        }
      ]
    }
  },
  '44444444-4444-4444-4444-444444444444': {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Open Badminton',
    status: 'draft',
    format: 'swiss',
    code: 'BAD-OPEN',
    bracket_data: {
      rounds: []
    }
  }
}

// Add legacy ID support
MOCK_TOURNAMENTS['1'] = MOCK_TOURNAMENTS['11111111-1111-1111-1111-111111111111']
MOCK_TOURNAMENTS['2'] = MOCK_TOURNAMENTS['22222222-2222-2222-2222-222222222222']
MOCK_TOURNAMENTS['3'] = MOCK_TOURNAMENTS['33333333-3333-3333-3333-333333333333']
MOCK_TOURNAMENTS['4'] = MOCK_TOURNAMENTS['44444444-4444-4444-4444-444444444444']

const TournamentDashboard = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('matches') // 'matches' or 'bracket'
  const [activeRound, setActiveRound] = useState(1)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    loadTournament()
  }, [id])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const loadTournament = async () => {
    setIsLoading(true)
    setError(null)

    if (MOCK_TOURNAMENTS[id]) {
      console.log('Loading mock tournament:', id)
      // If we already have local state for this mock tournament, don't reset it
      // This allows state persistence while navigating (in a real app this would be in a store)
      // For now, we just reload the initial mock data if tournament is null
      if (!tournament || tournament.id !== MOCK_TOURNAMENTS[id].id) {
         setTournament(JSON.parse(JSON.stringify(MOCK_TOURNAMENTS[id])))
      }
      setIsLoading(false)
      return
    }

    const { data, error: fetchError } = await getTournamentById(id)
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
    // Handle Mock Data
    if (MOCK_TOURNAMENTS[id] || (tournament && MOCK_TOURNAMENTS[tournament.id])) {
      const newTournament = JSON.parse(JSON.stringify(tournament))
      let matchFound = false
      
      if (newTournament.bracket_data.rounds) {
        for (const round of newTournament.bracket_data.rounds) {
          const match = round.matches.find(m => m.match_id === matchId)
          if (match) {
            match.winner = winner
            matchFound = true
            break
          }
        }
      }

      if (matchFound) {
        setTournament(newTournament)
        setNotification({ type: 'success', message: 'Résultat enregistré (Simulation) !' })
      }
      return
    }

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
    // Handle Mock Data
    if (MOCK_TOURNAMENTS[id] || (tournament && MOCK_TOURNAMENTS[tournament.id])) {
       alert("L'annulation n'est pas supportée en mode simulation.")
       return
    }

    const { error } = await undoLastMatchResult(tournament.id)
    if (error) {
      alert(`Erreur: ${error}`)
    } else {
      await loadTournament()
    }
  }

  const handleForceGenerate = async () => {
    if (!window.confirm('Voulez-vous forcer la génération du prochain tour ?')) return
    
    // Handle Mock Data
    if (MOCK_TOURNAMENTS[id] || (tournament && MOCK_TOURNAMENTS[tournament.id])) {
       const newTournament = JSON.parse(JSON.stringify(tournament))
       const currentRounds = newTournament.bracket_data.rounds
       const lastRound = currentRounds[currentRounds.length - 1]
       const nextRoundNumber = lastRound.round + 1
       
       let newMatches = []

       // LOGIC FOR SINGLE ELIMINATION
       if (newTournament.format === 'single-elimination') {
         const winners = lastRound.matches.map(m => m.winner).filter(w => w)
         if (winners.length < 2) {
           alert("Pas assez de vainqueurs pour générer le prochain tour (Simulation).")
           return
         }
         
         for (let i = 0; i < winners.length; i += 2) {
           if (i + 1 < winners.length) {
             newMatches.push({
               match_id: `m${nextRoundNumber}-${(i/2)+1}`,
               player1: winners[i],
               player2: winners[i+1],
               winner: null
             })
           }
         }
         
         if (newMatches.length > 0) {
           currentRounds.push({
             round: nextRoundNumber,
             name: newMatches.length === 1 ? 'Finale' : `Tour ${nextRoundNumber}`,
             matches: newMatches
           })
         } else {
            alert("Tournoi terminé ! (Simulation)")
            newTournament.status = 'completed'
         }
       }
       
       // LOGIC FOR DOUBLE ELIMINATION (Simplified - Winner Bracket only for now)
       else if (newTournament.format === 'double-elimination') {
          // Mocking just a simple progression for demo
          const winners = lastRound.matches.map(m => m.winner).filter(w => w)
          if (winners.length >= 2) {
             newMatches.push({
               match_id: `m${nextRoundNumber}-1`,
               player1: winners[0],
               player2: winners[1],
               winner: null
             })
             currentRounds.push({
               round: nextRoundNumber,
               name: `Winner Bracket - Tour ${nextRoundNumber}`,
               matches: newMatches
             })
          } else {
             alert("Simulation Double Elimination: Avancez les vainqueurs manuellement pour tester.")
             return
          }
       }

       // LOGIC FOR ROUND ROBIN
       else if (newTournament.format === 'round-robin') {
          // Generate a mock "Journée X"
          newMatches = [
             { match_id: `m${nextRoundNumber}-1`, player1: 'FC Rouge', player2: 'FC Vert', winner: null },
             { match_id: `m${nextRoundNumber}-2`, player1: 'FC Bleu', player2: 'FC Jaune', winner: null }
          ]
          currentRounds.push({
             round: nextRoundNumber,
             name: `Journée ${nextRoundNumber}`,
             matches: newMatches
          })
       }

       // LOGIC FOR SWISS
       else if (newTournament.format === 'swiss') {
          // Mock pairing
          newMatches = [
             { match_id: `m${nextRoundNumber}-1`, player1: 'Joueur 1', player2: 'Joueur 3', winner: null },
             { match_id: `m${nextRoundNumber}-2`, player1: 'Joueur 2', player2: 'Joueur 4', winner: null }
          ]
          currentRounds.push({
             round: nextRoundNumber,
             name: `Ronde ${nextRoundNumber}`,
             matches: newMatches
          })
       }

       setTournament(newTournament)
       setActiveRound(nextRoundNumber)
       setNotification({ type: 'success', message: 'Tour suivant généré (Simulation) !' })
       return
    }

    const { error } = await generateNextRound(tournament.id)
    if (error) {
      alert(`Erreur: ${error}`)
    } else {
      setNotification({ type: 'success', message: 'Tour suivant généré !' })
      await loadTournament()
    }
  }

  const copyPublicLink = () => {
    const url = `${window.location.origin}/tournament/${tournament.code || id}`
    navigator.clipboard.writeText(url)
      .then(() => alert('Lien public copié !'))
      .catch(() => alert('Erreur copie lien'))
  }

  if (isLoading) {
    return (
      <div className="tournament-dashboard">
        <header className="td-header">
          <div className="td-title-section">
            <div className="td-badges" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Skeleton type="rect" width="80px" height="24px" style={{ borderRadius: '999px' }} />
              <Skeleton type="rect" width="100px" height="24px" style={{ borderRadius: '999px' }} />
            </div>
            <Skeleton type="text" width="300px" height="32px" />
          </div>
          <div className="td-actions">
            <Skeleton type="rect" width="40px" height="40px" />
            <Skeleton type="rect" width="40px" height="40px" />
            <Skeleton type="rect" width="120px" height="40px" />
          </div>
        </header>

        <div className="td-tabs">
          <Skeleton type="rect" width="160px" height="40px" />
          <Skeleton type="rect" width="160px" height="40px" />
        </div>

        <div className="td-content">
          <div className="matches-view">
            <div className="round-selector-compact" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} type="rect" width="80px" height="32px" style={{ borderRadius: '999px' }} />
              ))}
            </div>
            <div className="matches-grid-compact">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="match-card" style={{ height: '120px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <Skeleton type="text" width="100px" height="20px" />
                    <Skeleton type="text" width="40px" height="20px" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Skeleton type="text" width="100%" height="24px" />
                    <Skeleton type="text" width="100%" height="24px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) return <div className="error-container">{error}</div>
  if (!tournament) return null

  const currentRoundMatches = tournament.bracket_data.rounds?.[activeRound - 1]?.matches || []
  const isRoundComplete = currentRoundMatches.length > 0 && currentRoundMatches.every(m => m.winner)
  const hasNextRound = tournament.bracket_data.rounds?.[activeRound] // Next round exists
  const isNextRoundReady = hasNextRound && hasNextRound.matches && hasNextRound.matches.length > 0

  const getTotalRounds = () => {
    if (!tournament) return 0
    
    // For Single/Double Elimination, we can estimate based on max_participants if available
    // or just use the current rounds length if we don't have that info.
    // In a real app, this should probably come from the backend.
    
    if (tournament.format === 'single-elimination' || tournament.format === 'double-elimination') {
       // Mock estimation: log2(8) = 3, log2(16) = 4, etc.
       // We'll use a hardcoded map for our mock data for better presentation
       const mockTotals = {
          '11111111-1111-1111-1111-111111111111': 3, // Tennis (8 players)
          '22222222-2222-2222-2222-222222222222': 4, // Basket (Double Elim is complex, just an estimate)
          '33333333-3333-3333-3333-333333333333': 6, // Football (Round Robin)
          '44444444-4444-4444-4444-444444444444': 5  // Badminton (Swiss)
       }
       return mockTotals[tournament.id] || tournament.bracket_data.rounds.length
    }
    
    return tournament.bracket_data.rounds.length
  }

  const totalRounds = getTotalRounds()

  return (
    <div className="tournament-dashboard">
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />} {notification.message}
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
              {tournament.sport}
            </span>
            <span className="format-badge">
              {tournament.format.replace('_', ' ')}
            </span>
            <span className="round-badge" style={{ background: '#e2e8f0', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
               Tour {activeRound} / {totalRounds > activeRound ? totalRounds : activeRound}
            </span>
          </div>
          <h1>{tournament.name}</h1>
        </div>
        
        <div className="td-actions">
          <button className="btn-icon" onClick={copyPublicLink} title="Copier lien public">
            <Share2 size={18} />
          </button>
          <button className="btn-icon" onClick={() => window.print()} title="Imprimer">
            <Printer size={18} />
          </button>
          <button className="btn-primary-sm" onClick={() => loadTournament()}>
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="td-tabs">
        <button 
          className={`td-tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <List size={18} /> Gestion des Matchs
        </button>
        <button 
          className={`td-tab ${activeTab === 'bracket' ? 'active' : ''}`}
          onClick={() => setActiveTab('bracket')}
        >
          <Layout size={18} /> Vue Tableau
        </button>
      </div>

      {/* Content Area */}
      <div className="td-content">
        {activeTab === 'matches' && (
          <div className="matches-view">
            {/* Round Selector - Always Visible */}
            <div className="round-selector-compact">
              {tournament.bracket_data.rounds && tournament.bracket_data.rounds.map((round) => (
                <button
                  key={round.round}
                  className={`round-pill ${activeRound === round.round ? 'active' : ''}`}
                  onClick={() => setActiveRound(round.round)}
                >
                  {round.name}
                </button>
              ))}
              {/* Ghost button for next round if not yet generated but expected */}
              {activeRound === tournament.bracket_data.rounds.length && activeRound < totalRounds && (
                 <button className="round-pill disabled" disabled>
                    Tour {activeRound + 1}
                 </button>
              )}
            </div>

            {/* Matches Grid */}
            {isRoundComplete && !isNextRoundReady && tournament.format === 'swiss' && (
               <div className="round-complete-banner">
                 <h3><CheckCircle size={24} /> Tour {activeRound} Terminé !</h3>
                 <p>Génération des prochains matchs en cours...</p>
                 <button 
                   className="btn-secondary-sm" 
                   style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white' }}
                   onClick={handleForceGenerate}
                 >
                   <RefreshCw size={16} /> Forcer la génération
                 </button>
               </div>
            )}
            
            {isRoundComplete && isNextRoundReady && (
               <div className="round-complete-banner ready" onClick={() => setActiveRound(activeRound + 1)}>
                 <h3><PlayCircle size={24} /> Le Tour {activeRound + 1} est prêt !</h3>
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
