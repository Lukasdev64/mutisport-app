/**
 * MatchCard Molecule Component (V2 - Enhanced)
 * Displays a match with detailed score editing capability
 *
 * Features:
 * - Player display with seeds
 * - Detailed score input (sets, games, tiebreaks)
 * - Winner selection
 * - Court and time display
 * - Status indicators
 * - Undo functionality
 * - Responsive design
 */

import React, { useState } from 'react'
import Player from '../atoms/Player'
import Score from '../atoms/Score'
import './MatchCardV2.css'

const MatchCardV2 = ({
  match,
  onUpdateResult,
  onUndo,
  canEdit = true,
  compact = false,
  className = ''
}) => {
  const [isEditingScore, setIsEditingScore] = useState(false)
  const [scoreInput, setScoreInput] = useState('')
  const [selectedWinner, setSelectedWinner] = useState(null)

  const handlePlayerClick = (playerId) => {
    if (!canEdit || match.status === 'completed') return
    setSelectedWinner(playerId)
  }

  const handleSubmitScore = () => {
    if (!selectedWinner) {
      alert('Please select a winner first')
      return
    }

    // Parse score input (e.g., "6-4 7-5" or "6-4 7-6(5)")
    onUpdateResult(match.id, selectedWinner, scoreInput)
    setIsEditingScore(false)
    setScoreInput('')
    setSelectedWinner(null)
  }

  const handleQuickWinner = (playerId) => {
    if (!canEdit || match.status === 'completed') return
    onUpdateResult(match.id, playerId, null)
  }

  const handleUndoClick = () => {
    if (window.confirm('Undo this match result?')) {
      onUndo(match.id)
    }
  }

  const isPlayer1Winner = match.winner_id === match.player1?.id
  const isPlayer2Winner = match.winner_id === match.player2?.id

  return (
    <div className={`match-card-v2 ${compact ? 'match-card-v2--compact' : ''} ${className}`}>
      {/* Header */}
      <div className="match-card-v2__header">
        <span className="match-card-v2__label">
          Match {match.match_number}
          {match.court && ` • Court ${match.court}`}
        </span>
        <span className={`match-card-v2__status match-card-v2__status--${match.status}`}>
          {match.status === 'completed' && '✓ Complete'}
          {match.status === 'in_progress' && '▶ In Progress'}
          {match.status === 'pending' && '⏳ Pending'}
        </span>
      </div>

      {/* Players */}
      <div className="match-card-v2__players">
        <Player
          name={match.player1?.name || 'BYE'}
          seed={match.player1?.seed}
          isWinner={isPlayer1Winner}
          isBye={!match.player1}
          onClick={canEdit && match.status !== 'completed' ? () => handlePlayerClick(match.player1?.id) : null}
          className={selectedWinner === match.player1?.id ? 'player--selected' : ''}
        />

        <div className="match-card-v2__vs">
          <span>vs</span>
        </div>

        <Player
          name={match.player2?.name || 'TBD'}
          seed={match.player2?.seed}
          isWinner={isPlayer2Winner}
          isTBD={!match.player2}
          onClick={canEdit && match.status !== 'completed' ? () => handlePlayerClick(match.player2?.id) : null}
          className={selectedWinner === match.player2?.id ? 'player--selected' : ''}
        />
      </div>

      {/* Score Display/Editor */}
      <div className="match-card-v2__score-section">
        {match.status === 'completed' ? (
          <div className="match-card-v2__score-display">
            <Score scoreData={match.score_data} compact={compact} />
            {canEdit && onUndo && (
              <button
                className="match-card-v2__undo-btn"
                onClick={handleUndoClick}
                aria-label="Undo result"
              >
                ↶ Undo
              </button>
            )}
          </div>
        ) : isEditingScore ? (
          <div className="match-card-v2__score-editor">
            <input
              type="text"
              className="match-card-v2__score-input"
              placeholder="e.g., 6-4 7-5 or 6-4 7-6(5)"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              autoFocus
            />
            <div className="match-card-v2__score-actions">
              <button
                className="match-card-v2__btn match-card-v2__btn--primary"
                onClick={handleSubmitScore}
                disabled={!selectedWinner}
              >
                Save Score
              </button>
              <button
                className="match-card-v2__btn match-card-v2__btn--secondary"
                onClick={() => {
                  setIsEditingScore(false)
                  setScoreInput('')
                  setSelectedWinner(null)
                }}
              >
                Cancel
              </button>
            </div>
            {selectedWinner && (
              <p className="match-card-v2__score-hint">
                Winner: {match.player1?.id === selectedWinner ? match.player1?.name : match.player2?.name}
              </p>
            )}
          </div>
        ) : canEdit ? (
          <div className="match-card-v2__actions">
            <button
              className="match-card-v2__btn match-card-v2__btn--primary"
              onClick={() => setIsEditingScore(true)}
              disabled={!match.player1 || !match.player2}
            >
              📝 Enter Score
            </button>
            <div className="match-card-v2__quick-actions">
              <span className="match-card-v2__quick-label">Quick:</span>
              <button
                className="match-card-v2__btn match-card-v2__btn--small"
                onClick={() => handleQuickWinner(match.player1?.id)}
                disabled={!match.player1 || !match.player2}
              >
                {match.player1?.name?.substring(0, 10) || 'P1'} wins
              </button>
              <button
                className="match-card-v2__btn match-card-v2__btn--small"
                onClick={() => handleQuickWinner(match.player2?.id)}
                disabled={!match.player1 || !match.player2}
              >
                {match.player2?.name?.substring(0, 10) || 'P2'} wins
              </button>
            </div>
          </div>
        ) : (
          <div className="match-card-v2__waiting">
            <p>Waiting for players...</p>
          </div>
        )}
      </div>

      {/* Footer (optional) */}
      {match.scheduled_at && (
        <div className="match-card-v2__footer">
          <span className="match-card-v2__time">
            ⏰ {new Date(match.scheduled_at).toLocaleString()}
          </span>
        </div>
      )}

      {match.notes && (
        <div className="match-card-v2__notes">
          <span className="match-card-v2__notes-label">Notes:</span>
          <p>{match.notes}</p>
        </div>
      )}
    </div>
  )
}

export default MatchCardV2
