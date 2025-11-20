/**
 * MatchCard - Composant pour afficher et gérer un match
 * Interface compacte et professionnelle
 */

import { useState } from 'react'
import './MatchCard.css'

const MatchCard = ({
  match,
  onWinner,
  onUndo,
  showUndo = false,
  disabled = false
}) => {
  const [confirmUndo, setConfirmUndo] = useState(false)

  const handleWinnerClick = (winner) => {
    if (disabled || match.winner) return
    onWinner(match.match_id, winner)
  }

  const handleUndoClick = () => {
    if (!showUndo) return

    if (!confirmUndo) {
      setConfirmUndo(true)
      // Auto-reset après 3 secondes
      setTimeout(() => setConfirmUndo(false), 3000)
    } else {
      onUndo(match.match_id)
      setConfirmUndo(false)
    }
  }

  const isCompleted = match.winner !== null && match.winner !== undefined
  const player1IsWinner = isCompleted && match.winner === match.player1
  const player2IsWinner = isCompleted && match.winner === match.player2

  return (
    <div className={`match-card ${isCompleted ? 'completed' : ''} ${disabled ? 'disabled' : ''}`}>
      <div className="match-card-header">
        <span className="match-number">Match {match.match_number}</span>
        {match.round && <span className="match-round">Tour {match.round}</span>}
      </div>

      <div className="match-players">
        <div className={`player-section ${player1IsWinner ? 'winner' : ''}`}>
          <div className="player-name">
            {match.player1 || <span className="tbd">À déterminer</span>}
          </div>
          {!isCompleted && match.player1 && match.player2 && (
            <button
              className="win-button"
              onClick={() => handleWinnerClick(match.player1)}
              disabled={disabled}
              aria-label={`${match.player1} gagne`}
            >
              <span className="win-text">Désigner vainqueur</span>
            </button>
          )}
          {player1IsWinner && (
            <div className="winner-badge">
              <span className="winner-text">Vainqueur</span>
            </div>
          )}
        </div>

        <div className="vs-divider">
          <span className="vs-text">VS</span>
        </div>

        <div className={`player-section ${player2IsWinner ? 'winner' : ''}`}>
          <div className="player-name">
            {match.player2 || <span className="tbd">À déterminer</span>}
          </div>
          {!isCompleted && match.player1 && match.player2 && (
            <button
              className="win-button"
              onClick={() => handleWinnerClick(match.player2)}
              disabled={disabled}
              aria-label={`${match.player2} gagne`}
            >
              <span className="win-text">Désigner vainqueur</span>
            </button>
          )}
          {player2IsWinner && (
            <div className="winner-badge">
              <span className="winner-text">Vainqueur</span>
            </div>
          )}
        </div>
      </div>

      {isCompleted && showUndo && (
        <div className="match-card-footer">
          <button
            className={`undo-button ${confirmUndo ? 'confirm' : ''}`}
            onClick={handleUndoClick}
            aria-label="Annuler le résultat"
          >
            {confirmUndo ? 'Confirmer l\'annulation' : 'Annuler le résultat'}
          </button>
        </div>
      )}
    </div>
  )
}

export default MatchCard
