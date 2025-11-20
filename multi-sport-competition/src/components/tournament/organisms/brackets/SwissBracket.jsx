/**
 * Swiss System Bracket Component
 * Displays standings with Buchholz + matches organized by rounds
 *
 * Features:
 * - Standings with Buchholz tiebreaker
 * - Round-by-round pairing
 * - Generate next round button
 * - Progress tracking
 */

import React, { useMemo, useState } from 'react'
import MatchCardV2 from '../../molecules/MatchCardV2'
import './SwissBracket.css'

const SwissBracket = ({
  players = [],
  matches = [],
  rounds = [],
  currentRound = 1,
  totalRounds = 5,
  onUpdateMatch,
  onUndoMatch,
  onGenerateNextRound,
  canEdit = true,
  compact = false
}) => {
  const [activeRound, setActiveRound] = useState(null)

  // Calculate standings with Buchholz
  const standings = useMemo(() => {
    const stats = {}

    // Initialize
    players.forEach(player => {
      stats[player.id] = {
        id: player.id,
        name: player.name,
        played: player.matches_played || 0,
        won: player.matches_won || 0,
        lost: player.matches_lost || 0,
        points: player.points || 0,
        buchholz: player.buchholz_score || 0
      }
    })

    // Sort by points DESC, then Buchholz DESC, then wins DESC
    return Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz
      return b.won - a.won
    })
  }, [players])

  // Group matches by round
  const matchesByRound = useMemo(() => {
    const grouped = {}
    matches.forEach(match => {
      if (!grouped[match.round_number]) {
        grouped[match.round_number] = []
      }
      grouped[match.round_number].push(match)
    })
    return grouped
  }, [matches])

  const sortedRounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b)

  // Check if current round is complete
  const isCurrentRoundComplete = useMemo(() => {
    const currentMatches = matchesByRound[currentRound] || []
    return currentMatches.length > 0 && currentMatches.every(m => m.status === 'completed')
  }, [matchesByRound, currentRound])

  const canGenerateNext = canEdit && isCurrentRoundComplete && currentRound < totalRounds

  return (
    <div className={`swiss-bracket ${compact ? 'swiss-bracket--compact' : ''}`}>
      {/* Progress Bar */}
      <div className="swiss-progress">
        <div className="swiss-progress__header">
          <h3 className="swiss-progress__title">Tournament Progress</h3>
          <span className="swiss-progress__meta">
            Round {currentRound} of {totalRounds}
          </span>
        </div>
        <div className="swiss-progress__bar">
          <div
            className="swiss-progress__fill"
            style={{ width: `${(currentRound / totalRounds) * 100}%` }}
          />
        </div>
      </div>

      {/* Standings Table */}
      <div className="swiss-standings">
        <h2 className="swiss-standings__title">📊 Standings</h2>

        <div className="swiss-standings-table-wrapper">
          <table className="swiss-standings-table">
            <thead>
              <tr>
                <th className="swiss-standings-table__rank">#</th>
                <th className="swiss-standings-table__player">Player</th>
                <th className="swiss-standings-table__stat">Played</th>
                <th className="swiss-standings-table__stat">Won</th>
                <th className="swiss-standings-table__stat">Lost</th>
                <th className="swiss-standings-table__stat swiss-standings-table__stat--highlight">Points</th>
                <th className="swiss-standings-table__stat swiss-standings-table__stat--buchholz" title="Buchholz (tiebreaker)">
                  Buchholz
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map((player, idx) => (
                <tr key={player.id} className={idx < 3 ? `swiss-standings-table__row--top${idx + 1}` : ''}>
                  <td className="swiss-standings-table__rank">
                    {idx === 0 && '🥇'}
                    {idx === 1 && '🥈'}
                    {idx === 2 && '🥉'}
                    {idx > 2 && idx + 1}
                  </td>
                  <td className="swiss-standings-table__player">{player.name}</td>
                  <td className="swiss-standings-table__stat">{player.played}</td>
                  <td className="swiss-standings-table__stat swiss-standings-table__stat--won">{player.won}</td>
                  <td className="swiss-standings-table__stat swiss-standings-table__stat--lost">{player.lost}</td>
                  <td className="swiss-standings-table__stat swiss-standings-table__stat--highlight">{player.points}</td>
                  <td className="swiss-standings-table__stat swiss-standings-table__stat--buchholz">
                    {player.buchholz.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="swiss-standings__note">
          <span className="swiss-standings__note-icon">ℹ️</span>
          <span>Buchholz score = sum of opponents' points (tiebreaker)</span>
        </div>
      </div>

      {/* Rounds Tabs */}
      <div className="swiss-rounds-tabs">
        <button
          className={`swiss-rounds-tab ${activeRound === null ? 'swiss-rounds-tab--active' : ''}`}
          onClick={() => setActiveRound(null)}
        >
          All Rounds
        </button>
        {sortedRounds.map(roundNum => {
          const roundMatches = matchesByRound[roundNum]
          const completedCount = roundMatches.filter(m => m.status === 'completed').length
          const totalCount = roundMatches.length
          const isComplete = completedCount === totalCount

          return (
            <button
              key={roundNum}
              className={`swiss-rounds-tab ${activeRound === roundNum ? 'swiss-rounds-tab--active' : ''} ${isComplete ? 'swiss-rounds-tab--complete' : ''}`}
              onClick={() => setActiveRound(roundNum)}
            >
              Round {roundNum}
              <span className="swiss-rounds-tab__badge">
                {isComplete ? '✓' : `${completedCount}/${totalCount}`}
              </span>
            </button>
          )
        })}

        {/* Generate Next Round Button */}
        {canGenerateNext && (
          <button
            className="swiss-rounds-tab swiss-rounds-tab--generate"
            onClick={onGenerateNextRound}
          >
            ➕ Generate Round {currentRound + 1}
          </button>
        )}
      </div>

      {/* Matches */}
      <div className="swiss-matches">
        {sortedRounds
          .filter(roundNum => activeRound === null || activeRound === roundNum)
          .map(roundNum => {
            const roundMatches = matchesByRound[roundNum]
            const roundInfo = rounds?.find(r => r.round_number === roundNum)

            return (
              <div key={roundNum} className="swiss-round">
                <div className="swiss-round__header">
                  <h3 className="swiss-round__title">
                    {roundInfo?.name || `Round ${roundNum}`}
                  </h3>
                  <span className="swiss-round__meta">
                    {roundMatches.filter(m => m.status === 'completed').length} / {roundMatches.length} completed
                  </span>
                </div>

                <div className="swiss-round__matches">
                  {roundMatches
                    .sort((a, b) => a.match_number - b.match_number)
                    .map(match => (
                      <MatchCardV2
                        key={match.id}
                        match={match}
                        onUpdateResult={onUpdateMatch}
                        onUndo={onUndoMatch}
                        canEdit={canEdit}
                        compact={compact}
                      />
                    ))}
                </div>
              </div>
            )
          })}
      </div>

      {sortedRounds.length === 0 && (
        <div className="swiss-empty">
          <p>No matches scheduled yet</p>
        </div>
      )}
    </div>
  )
}

export default SwissBracket
