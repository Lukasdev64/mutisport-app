/**
 * Round Robin Bracket Component
 * Displays standings table + matches organized by rounds
 *
 * Features:
 * - Standings table (sortable)
 * - Matches by round
 * - Win/Loss/Draw tracking
 * - Responsive layout
 */

import React, { useMemo, useState } from 'react'
import MatchCardV2 from '../../molecules/MatchCardV2'
import './RoundRobinBracket.css'

const RoundRobinBracket = ({
  players = [],
  matches = [],
  rounds = [],
  onUpdateMatch,
  onUndoMatch,
  canEdit = true,
  compact = false
}) => {
  const [activeRound, setActiveRound] = useState(null)

  // Calculate standings from matches
  const standings = useMemo(() => {
    const stats = {}

    // Initialize
    players.forEach(player => {
      stats[player.id] = {
        id: player.id,
        name: player.name,
        played: 0,
        won: 0,
        lost: 0,
        points: 0
      }
    })

    // Calculate from matches
    matches.forEach(match => {
      if (match.status !== 'completed' || !match.winner_id) return

      const p1 = stats[match.player1?.id]
      const p2 = stats[match.player2?.id]

      if (p1) p1.played++
      if (p2) p2.played++

      if (match.winner_id === match.player1?.id) {
        if (p1) {
          p1.won++
          p1.points++
        }
        if (p2) p2.lost++
      } else if (match.winner_id === match.player2?.id) {
        if (p2) {
          p2.won++
          p2.points++
        }
        if (p1) p1.lost++
      }
    })

    // Sort by points DESC, then wins DESC
    return Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      return b.won - a.won
    })
  }, [players, matches])

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

  return (
    <div className={`round-robin-bracket ${compact ? 'round-robin-bracket--compact' : ''}`}>
      {/* Standings Table */}
      <div className="rr-standings">
        <h2 className="rr-standings__title">📊 Standings</h2>

        <div className="rr-standings-table-wrapper">
          <table className="rr-standings-table">
            <thead>
              <tr>
                <th className="rr-standings-table__rank">#</th>
                <th className="rr-standings-table__player">Player</th>
                <th className="rr-standings-table__stat">Played</th>
                <th className="rr-standings-table__stat">Won</th>
                <th className="rr-standings-table__stat">Lost</th>
                <th className="rr-standings-table__stat rr-standings-table__stat--highlight">Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((player, idx) => (
                <tr key={player.id} className={idx < 3 ? `rr-standings-table__row--top${idx + 1}` : ''}>
                  <td className="rr-standings-table__rank">
                    {idx === 0 && '🥇'}
                    {idx === 1 && '🥈'}
                    {idx === 2 && '🥉'}
                    {idx > 2 && idx + 1}
                  </td>
                  <td className="rr-standings-table__player">{player.name}</td>
                  <td className="rr-standings-table__stat">{player.played}</td>
                  <td className="rr-standings-table__stat rr-standings-table__stat--won">{player.won}</td>
                  <td className="rr-standings-table__stat rr-standings-table__stat--lost">{player.lost}</td>
                  <td className="rr-standings-table__stat rr-standings-table__stat--highlight">{player.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rounds Tabs */}
      <div className="rr-rounds-tabs">
        <button
          className={`rr-rounds-tab ${activeRound === null ? 'rr-rounds-tab--active' : ''}`}
          onClick={() => setActiveRound(null)}
        >
          All Rounds
        </button>
        {sortedRounds.map(roundNum => {
          const roundMatches = matchesByRound[roundNum]
          const completedCount = roundMatches.filter(m => m.status === 'completed').length
          const totalCount = roundMatches.length

          return (
            <button
              key={roundNum}
              className={`rr-rounds-tab ${activeRound === roundNum ? 'rr-rounds-tab--active' : ''}`}
              onClick={() => setActiveRound(roundNum)}
            >
              Round {roundNum}
              <span className="rr-rounds-tab__badge">
                {completedCount}/{totalCount}
              </span>
            </button>
          )
        })}
      </div>

      {/* Matches */}
      <div className="rr-matches">
        {sortedRounds
          .filter(roundNum => activeRound === null || activeRound === roundNum)
          .map(roundNum => {
            const roundMatches = matchesByRound[roundNum]
            const roundInfo = rounds?.find(r => r.round_number === roundNum)

            return (
              <div key={roundNum} className="rr-round">
                <div className="rr-round__header">
                  <h3 className="rr-round__title">
                    {roundInfo?.name || `Round ${roundNum}`}
                  </h3>
                  <span className="rr-round__meta">
                    {roundMatches.filter(m => m.status === 'completed').length} / {roundMatches.length} completed
                  </span>
                </div>

                <div className="rr-round__matches">
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
        <div className="rr-empty">
          <p>No matches scheduled yet</p>
        </div>
      )}
    </div>
  )
}

export default RoundRobinBracket
