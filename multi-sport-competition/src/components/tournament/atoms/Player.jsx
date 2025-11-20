/**
 * Player Atom Component
 * Displays a player name with optional seed and status
 */

import React from 'react'
import './Player.css'

const Player = ({
  name,
  seed = null,
  isWinner = false,
  isBye = false,
  isTBD = false,
  onClick = null,
  className = ''
}) => {
  const playerClasses = [
    'player',
    isWinner && 'player--winner',
    isBye && 'player--bye',
    isTBD && 'player--tbd',
    onClick && 'player--clickable',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={playerClasses} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {seed && <span className="player__seed">{seed}</span>}
      <span className="player__name">{name || 'TBD'}</span>
      {isWinner && <span className="player__badge" aria-label="Winner">🏆</span>}
    </div>
  )
}

export default Player
