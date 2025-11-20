/**
 * BracketDisplay - Composant pour afficher l'arbre du tournoi
 * Affichage visuel simple et lisible pour seniors
 */

import { useMemo } from 'react'
import './BracketDisplay.css'

const BracketDisplay = ({ bracket, format }) => {
  if (!bracket || !bracket.rounds) {
    return (
      <div className="bracket-display-empty">
        <p>Aucun bracket à afficher</p>
      </div>
    )
  }

  // Rendu pour élimination simple
  if (format === 'single_elimination') {
    return <SingleEliminationBracket rounds={bracket.rounds} />
  }

  // Rendu pour round-robin
  if (format === 'round_robin') {
    return <RoundRobinBracket rounds={bracket.rounds} standings={bracket.standings} />
  }

  // Rendu pour système suisse
  if (format === 'swiss') {
    return <SwissBracket rounds={bracket.rounds} standings={bracket.standings} />
  }

  // Rendu pour double élimination
  if (format === 'double_elimination') {
    return <DoubleEliminationBracket bracket={bracket} />
  }

  return <div>Format non supporté: {format}</div>
}

// Composant pour élimination simple
const SingleEliminationBracket = ({ rounds }) => {
  return (
    <div className="bracket-container" aria-label="Arbre du tournoi">
      <div className="bracket-single-elimination" role="list">
        {rounds.map((round) => (
          <div key={round.round} className="bracket-round" role="listitem">
            <div className="round-header">
              <h3>{round.name}</h3>
            </div>
            <div className="round-matches" role="list">
              {round.matches.map((match) => (
                <div 
                  key={match.match_id} 
                  className="bracket-match" 
                  role="listitem"
                  aria-label={`Match entre ${match.player1 || 'TBD'} et ${match.player2 || 'TBD'}`}
                >
                  <div className={`bracket-player ${match.winner === match.player1 ? 'winner' : ''}`}>
                    <span className="player-name">{match.player1 || 'TBD'}</span>
                    {match.winner === match.player1 && (
                      <>
                        <span className="win-indicator" aria-hidden="true">✓</span>
                        <span className="sr-only">Vainqueur</span>
                      </>
                    )}
                  </div>
                  <div className={`bracket-player ${match.winner === match.player2 ? 'winner' : ''}`}>
                    <span className="player-name">{match.player2 || 'TBD'}</span>
                    {match.winner === match.player2 && (
                      <>
                        <span className="win-indicator" aria-hidden="true">✓</span>
                        <span className="sr-only">Vainqueur</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant pour round-robin
const RoundRobinBracket = ({ rounds, standings }) => {
  return (
    <div className="bracket-container" aria-label="Résultats du tournoi Round-Robin">
      {/* Classement */}
      {standings && (
        <div className="standings-section">
          <h3>Classement</h3>
          <div className="standings-table" role="table" aria-label="Classement des joueurs">
            <div className="standings-header" role="rowgroup">
              <div className="standings-row header" role="row">
                <div className="standings-col" role="columnheader">Position</div>
                <div className="standings-col" role="columnheader">Joueur</div>
                <div className="standings-col" role="columnheader" aria-label="Victoires">V</div>
                <div className="standings-col" role="columnheader" aria-label="Défaites">D</div>
                <div className="standings-col" role="columnheader">Points</div>
              </div>
            </div>
            <div role="rowgroup">
              {standings
                .sort((a, b) => b.points - a.points || b.wins - a.wins)
                .map((standing, index) => (
                  <div key={standing.player} className="standings-row" role="row">
                    <div className="standings-col position" role="cell">{index + 1}</div>
                    <div className="standings-col player" role="cell">{standing.player}</div>
                    <div className="standings-col" role="cell">{standing.wins}</div>
                    <div className="standings-col" role="cell">{standing.losses}</div>
                    <div className="standings-col points" role="cell">{standing.points}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tours */}
      <div className="bracket-round-robin" role="list">
        {rounds.map((round) => (
          <div key={round.round} className="bracket-round" role="listitem">
            <div className="round-header">
              <h3>{round.name}</h3>
            </div>
            <div className="round-matches-grid" role="list">
              {round.matches.map((match) => (
                <div 
                  key={match.match_id} 
                  className="bracket-match-compact"
                  role="listitem"
                  aria-label={`Match entre ${match.player1} et ${match.player2}`}
                >
                  <span className={`player ${match.winner === match.player1 ? 'winner' : ''}`}>
                    {match.player1}
                    {match.winner === match.player1 && <span className="sr-only"> (Vainqueur)</span>}
                  </span>
                  <span className="vs" aria-hidden="true">vs</span>
                  <span className={`player ${match.winner === match.player2 ? 'winner' : ''}`}>
                    {match.player2}
                    {match.winner === match.player2 && <span className="sr-only"> (Vainqueur)</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant pour système suisse
const SwissBracket = ({ rounds, standings }) => {
  return (
    <div className="bracket-container" aria-label="Résultats du tournoi Système Suisse">
      {/* Classement */}
      {standings && (
        <div className="standings-section">
          <h3>Classement actuel</h3>
          <div className="standings-table" role="table" aria-label="Classement actuel">
            <div className="standings-header" role="rowgroup">
              <div className="standings-row header" role="row">
                <div className="standings-col" role="columnheader">Position</div>
                <div className="standings-col" role="columnheader">Joueur</div>
                <div className="standings-col" role="columnheader" aria-label="Victoires">V</div>
                <div className="standings-col" role="columnheader" aria-label="Défaites">D</div>
                <div className="standings-col" role="columnheader">Points</div>
              </div>
            </div>
            <div role="rowgroup">
              {standings
                .sort((a, b) => b.points - a.points || b.wins - a.wins)
                .map((standing, index) => (
                  <div key={standing.player} className="standings-row" role="row">
                    <div className="standings-col position" role="cell">{index + 1}</div>
                    <div className="standings-col player" role="cell">{standing.player}</div>
                    <div className="standings-col" role="cell">{standing.wins}</div>
                    <div className="standings-col" role="cell">{standing.losses}</div>
                    <div className="standings-col points" role="cell">{standing.points}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tours */}
      <div className="bracket-swiss" role="list">
        {rounds.map((round) => (
          <div key={round.round} className="bracket-round" role="listitem">
            <div className="round-header">
              <h3>{round.name}</h3>
              {round.status === 'pending' && (
                <span className="round-status">En attente</span>
              )}
            </div>
            {round.matches.length > 0 ? (
              <div className="round-matches-grid" role="list">
                {round.matches.map((match) => (
                  <div 
                    key={match.match_id} 
                    className="bracket-match-compact"
                    role="listitem"
                    aria-label={`Match entre ${match.player1 || 'TBD'} et ${match.player2 || 'TBD'}`}
                  >
                    <span className={`player ${match.winner === match.player1 ? 'winner' : ''}`}>
                      {match.player1 || 'TBD'}
                      {match.winner === match.player1 && <span className="sr-only"> (Vainqueur)</span>}
                    </span>
                    <span className="vs" aria-hidden="true">vs</span>
                    <span className={`player ${match.winner === match.player2 ? 'winner' : ''}`}>
                      {match.player2 || 'TBD'}
                      {match.winner === match.player2 && <span className="sr-only"> (Vainqueur)</span>}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="round-pending-message">
                Les matchs seront générés après les résultats du tour précédent
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant pour double élimination (simplifié)
const DoubleEliminationBracket = ({ bracket }) => {
  return (
    <div className="bracket-container" aria-label="Arbre du tournoi Double Élimination">
      <div className="double-elimination-bracket">
        {/* Winner Bracket */}
        <div className="bracket-section" role="region" aria-label="Winner Bracket">
          <h2 className="bracket-section-title">Winner Bracket</h2>
          <div className="bracket-single-elimination" role="list">
            {bracket.winner_bracket.map((round) => (
              <div key={round.round} className="bracket-round" role="listitem">
                <div className="round-header">
                  <h3>{round.name}</h3>
                </div>
                <div className="round-matches" role="list">
                  {round.matches.map((match) => (
                    <div 
                      key={match.match_id} 
                      className="bracket-match"
                      role="listitem"
                      aria-label={`Match entre ${match.player1 || 'TBD'} et ${match.player2 || 'TBD'}`}
                    >
                      <div className={`bracket-player ${match.winner === match.player1 ? 'winner' : ''}`}>
                        <span className="player-name">{match.player1 || 'TBD'}</span>
                        {match.winner === match.player1 && (
                          <>
                            <span className="win-indicator" aria-hidden="true">✓</span>
                            <span className="sr-only">Vainqueur</span>
                          </>
                        )}
                      </div>
                      <div className={`bracket-player ${match.winner === match.player2 ? 'winner' : ''}`}>
                        <span className="player-name">{match.player2 || 'TBD'}</span>
                        {match.winner === match.player2 && (
                          <>
                            <span className="win-indicator" aria-hidden="true">✓</span>
                            <span className="sr-only">Vainqueur</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loser Bracket */}
        <div className="bracket-section" role="region" aria-label="Loser Bracket">
          <h2 className="bracket-section-title">Loser Bracket</h2>
          <div className="bracket-single-elimination" role="list">
            {bracket.loser_bracket.map((round) => (
              <div key={round.round} className="bracket-round" role="listitem">
                <div className="round-header">
                  <h3>{round.name}</h3>
                </div>
                <div className="round-matches" role="list">
                  {round.matches.map((match) => (
                    <div 
                      key={match.match_id} 
                      className="bracket-match"
                      role="listitem"
                      aria-label={`Match entre ${match.player1 || 'TBD'} et ${match.player2 || 'TBD'}`}
                    >
                      <div className={`bracket-player ${match.winner === match.player1 ? 'winner' : ''}`}>
                        <span className="player-name">{match.player1 || 'TBD'}</span>
                        {match.winner === match.player1 && (
                          <>
                            <span className="win-indicator" aria-hidden="true">✓</span>
                            <span className="sr-only">Vainqueur</span>
                          </>
                        )}
                      </div>
                      <div className={`bracket-player ${match.winner === match.player2 ? 'winner' : ''}`}>
                        <span className="player-name">{match.player2 || 'TBD'}</span>
                        {match.winner === match.player2 && (
                          <>
                            <span className="win-indicator" aria-hidden="true">✓</span>
                            <span className="sr-only">Vainqueur</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grand Final */}
        <div className="bracket-section grand-final-section" role="region" aria-label="Grande Finale">
          <h2 className="bracket-section-title">Grande Finale</h2>
          <div className="bracket-round">
            {bracket.grand_final.matches.map((match) => (
              <div 
                key={match.match_id} 
                className="bracket-match grand-final-match"
                role="listitem"
                aria-label={`Grande Finale entre ${match.player1 || 'TBD'} et ${match.player2 || 'TBD'}`}
              >
                <div className={`bracket-player ${match.winner === match.player1 ? 'winner' : ''}`}>
                  <span className="player-name">{match.player1 || 'TBD'}</span>
                  {match.winner === match.player1 && (
                    <>
                      <span className="win-indicator" aria-hidden="true">✓</span>
                      <span className="sr-only">Vainqueur</span>
                    </>
                  )}
                </div>
                <div className={`bracket-player ${match.winner === match.player2 ? 'winner' : ''}`}>
                  <span className="player-name">{match.player2 || 'TBD'}</span>
                  {match.winner === match.player2 && (
                    <>
                      <span className="win-indicator" aria-hidden="true">✓</span>
                      <span className="sr-only">Vainqueur</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BracketDisplay
