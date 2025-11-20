/**
 * Score Atom Component
 * Displays match score (sets, games, tiebreaks)
 */

import React from 'react'
import './Score.css'

const Score = ({ scoreData, compact = false }) => {
  if (!scoreData || !scoreData.sets || scoreData.sets.length === 0) {
    return <span className="score score--empty">-</span>
  }

  return (
    <div className={`score ${compact ? 'score--compact' : ''}`}>
      {scoreData.sets.map((set, idx) => {
        const tiebreak = scoreData.tiebreaks?.[idx]
        const setClasses = [
          'score__set',
          set.player1 > set.player2 && 'score__set--p1-won',
          set.player2 > set.player1 && 'score__set--p2-won'
        ].filter(Boolean).join(' ')

        return (
          <span key={idx} className={setClasses}>
            {set.player1}-{set.player2}
            {tiebreak !== null && tiebreak !== undefined && (
              <sup className="score__tiebreak">({tiebreak})</sup>
            )}
          </span>
        )
      })}
    </div>
  )
}

export default Score
