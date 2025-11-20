/**
 * Single Elimination Bracket Component
 * Renders a tournament bracket in single elimination format
 *
 * Features:
 * - Multiple rounds display
 * - Connector lines between matches
 * - Responsive layout
 * - Match cards with score editing
 */

import React from 'react'
import MatchCardV2 from '../../molecules/MatchCardV2'
import './SingleEliminationBracket.css'

const SingleEliminationBracket = ({
  matches = [],
  rounds = [],
  onUpdateMatch,
  onUndoMatch,
  canEdit = true,
  compact = false
}) => {
  // Group matches by round
  const matchesByRound = {}
  matches.forEach(match => {
    if (!matchesByRound[match.round_number]) {
      matchesByRound[match.round_number] = []
    }
    matchesByRound[match.round_number].push(match)
  })

  // Sort rounds
  const sortedRounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b)

  if (sortedRounds.length === 0) {
    return (
      <div className="bracket-empty">
        <p>No matches available</p>
      </div>
    )
  }

  return (
    <div className={`single-elim-bracket ${compact ? 'single-elim-bracket--compact' : ''}`}>
      {sortedRounds.map(roundNum => {
        const roundMatches = matchesByRound[roundNum]
        const roundInfo = rounds?.find(r => r.round_number === roundNum)

        // Generate round name if not provided
        const totalRounds = sortedRounds.length
        let roundName = roundInfo?.name || `Round ${roundNum}`
        if (!roundInfo?.name) {
          if (roundNum === totalRounds) roundName = 'Final'
          else if (roundNum === totalRounds - 1) roundName = 'Semi-Finals'
          else if (roundNum === totalRounds - 2) roundName = 'Quarter-Finals'
        }

        return (
          <div key={roundNum} className="bracket-round">
            <div className="bracket-round__header">
              <h3 className="bracket-round__title">{roundName}</h3>
              <span className="bracket-round__meta">
                {roundMatches.length} {roundMatches.length === 1 ? 'match' : 'matches'}
              </span>
            </div>

            <div className="bracket-round__matches">
              {roundMatches
                .sort((a, b) => a.match_number - b.match_number)
                .map(match => (
                  <div key={match.id} className="bracket-match-wrapper">
                    <MatchCardV2
                      match={match}
                      onUpdateResult={onUpdateMatch}
                      onUndo={onUndoMatch}
                      canEdit={canEdit}
                      compact={compact}
                    />

                    {/* Connector line to next match */}
                    {roundNum < totalRounds && (
                      <div className="bracket-connector" aria-hidden="true">
                        <svg width="40" height="100%" viewBox="0 0 40 100" preserveAspectRatio="none">
                          <path
                            d="M 0 50 L 20 50 L 20 50 L 40 50"
                            stroke="#d1d5db"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="bracket-legend">
        <div className="bracket-legend__item">
          <span className="bracket-legend__icon bracket-legend__icon--completed">✓</span>
          <span className="bracket-legend__label">Completed</span>
        </div>
        <div className="bracket-legend__item">
          <span className="bracket-legend__icon bracket-legend__icon--pending">⏳</span>
          <span className="bracket-legend__label">Pending</span>
        </div>
      </div>
    </div>
  )
}

export default SingleEliminationBracket
