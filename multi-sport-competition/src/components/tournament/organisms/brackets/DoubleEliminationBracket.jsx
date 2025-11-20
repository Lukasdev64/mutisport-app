/**
 * Double Elimination Bracket Component
 * Renders winner bracket, loser bracket, and grand final
 *
 * Features:
 * - Winner bracket (top)
 * - Loser bracket (bottom)
 * - Grand final (with bracket reset support)
 * - Visual distinction between brackets
 * - Feeding lines showing loser progression
 */

import React, { useMemo } from 'react'
import MatchCardV2 from '../../molecules/MatchCardV2'
import './DoubleEliminationBracket.css'

const DoubleEliminationBracket = ({
  matches = [],
  rounds = [],
  onUpdateMatch,
  onUndoMatch,
  canEdit = true,
  compact = false
}) => {
  // Separate matches by bracket type
  const { winnerMatches, loserMatches, grandFinalMatches } = useMemo(() => {
    const winner = matches.filter(m => m.bracket_type === 'winner')
    const loser = matches.filter(m => m.bracket_type === 'loser')
    const grandFinal = matches.filter(m => m.bracket_type === 'grand_final')

    return {
      winnerMatches: winner,
      loserMatches: loser,
      grandFinalMatches: grandFinal
    }
  }, [matches])

  // Group by rounds
  const groupByRound = (matchList) => {
    const grouped = {}
    matchList.forEach(match => {
      if (!grouped[match.round_number]) {
        grouped[match.round_number] = []
      }
      grouped[match.round_number].push(match)
    })
    return grouped
  }

  const winnerByRound = groupByRound(winnerMatches)
  const loserByRound = groupByRound(loserMatches)

  const winnerRounds = Object.keys(winnerByRound).map(Number).sort((a, b) => a - b)
  const loserRounds = Object.keys(loserByRound).map(Number).sort((a, b) => a - b)

  if (winnerRounds.length === 0 && loserRounds.length === 0) {
    return (
      <div className="bracket-empty">
        <p>No matches available</p>
      </div>
    )
  }

  const renderBracket = (roundNumbers, matchesByRound, bracketType) => (
    <div className={`de-bracket-section de-bracket-section--${bracketType}`}>
      <div className="de-bracket-section__header">
        <h2 className="de-bracket-section__title">
          {bracketType === 'winner' ? '🏆 Winner Bracket' : '💔 Loser Bracket'}
        </h2>
      </div>

      <div className="de-bracket-rounds">
        {roundNumbers.map(roundNum => {
          const roundMatches = matchesByRound[roundNum]
          const totalRounds = roundNumbers.length

          let roundName = `Round ${roundNum}`
          if (bracketType === 'winner') {
            if (roundNum === totalRounds) roundName = 'Finals'
            else if (roundNum === totalRounds - 1) roundName = 'Semi-Finals'
            else if (roundNum === totalRounds - 2) roundName = 'Quarter-Finals'
          } else {
            roundName = `LB Round ${roundNum}`
          }

          return (
            <div key={`${bracketType}-${roundNum}`} className="de-bracket-round">
              <div className="de-bracket-round__header">
                <h3 className="de-bracket-round__title">{roundName}</h3>
                <span className="de-bracket-round__meta">
                  {roundMatches.length} {roundMatches.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              <div className="de-bracket-round__matches">
                {roundMatches
                  .sort((a, b) => a.match_number - b.match_number)
                  .map(match => (
                    <div key={match.id} className="de-match-wrapper">
                      <MatchCardV2
                        match={match}
                        onUpdateResult={onUpdateMatch}
                        onUndo={onUndoMatch}
                        canEdit={canEdit}
                        compact={compact}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className={`double-elim-bracket ${compact ? 'double-elim-bracket--compact' : ''}`}>
      {/* Winner Bracket */}
      {winnerRounds.length > 0 && renderBracket(winnerRounds, winnerByRound, 'winner')}

      {/* Loser Bracket */}
      {loserRounds.length > 0 && renderBracket(loserRounds, loserByRound, 'loser')}

      {/* Grand Final */}
      {grandFinalMatches.length > 0 && (
        <div className="de-bracket-section de-bracket-section--grand-final">
          <div className="de-bracket-section__header">
            <h2 className="de-bracket-section__title">
              ⭐ Grand Final
            </h2>
          </div>

          <div className="de-grand-final">
            {grandFinalMatches
              .sort((a, b) => a.round_number - b.round_number)
              .map((match, idx) => (
                <div key={match.id} className="de-grand-final-match">
                  <div className="de-grand-final-label">
                    {idx === 0 ? 'Grand Final 1' : 'Grand Final 2 (Bracket Reset)'}
                  </div>

                  {idx === 1 && match.status === 'conditional' && (
                    <div className="de-grand-final-note">
                      ⚠️ Only played if Loser Bracket champion wins GF1
                    </div>
                  )}

                  <MatchCardV2
                    match={match}
                    onUpdateResult={onUpdateMatch}
                    onUndo={onUndoMatch}
                    canEdit={canEdit}
                    compact={compact}
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="de-bracket-legend">
        <div className="de-bracket-legend__item">
          <span className="de-bracket-legend__badge de-bracket-legend__badge--winner">WB</span>
          <span className="de-bracket-legend__label">Winner Bracket</span>
        </div>
        <div className="de-bracket-legend__item">
          <span className="de-bracket-legend__badge de-bracket-legend__badge--loser">LB</span>
          <span className="de-bracket-legend__label">Loser Bracket</span>
        </div>
        <div className="de-bracket-legend__item">
          <span className="de-bracket-legend__badge de-bracket-legend__badge--gf">GF</span>
          <span className="de-bracket-legend__label">Grand Final</span>
        </div>
      </div>
    </div>
  )
}

export default DoubleEliminationBracket
