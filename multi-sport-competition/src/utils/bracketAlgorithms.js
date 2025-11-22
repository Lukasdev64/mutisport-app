/**
 * Algorithmes de génération de brackets pour différents formats de tournoi
 */

/**
 * Générer un bracket d'élimination simple (Single Elimination)
 *
 * @param {Array<string>} players - Liste des noms de joueurs
 * @returns {Object} Structure du bracket
 */
export const generateSingleEliminationBracket = (players) => {
  const playerCount = players.length

  // Trouver la puissance de 2 supérieure ou égale
  const roundCount = Math.ceil(Math.log2(playerCount))
  const bracketSize = Math.pow(2, roundCount)

  // Créer les tours
  const rounds = []

  // Premier tour avec byes si nécessaire
  const firstRoundMatches = []
  const byeCount = bracketSize - playerCount

  let playerIndex = 0
  for (let i = 0; i < bracketSize / 2; i++) {
    const player1 = playerIndex < players.length ? players[playerIndex++] : null
    const player2 = playerIndex < players.length ? players[playerIndex++] : null

    firstRoundMatches.push({
      match_id: `r1_m${i + 1}`,
      round: 1,
      match_number: i + 1,
      player1: player1,
      player2: player2,
      winner: player2 === null ? player1 : null, // Bye automatique
      next_match_id: `r2_m${Math.floor(i / 2) + 1}`,
    })
  }

  rounds.push({
    round: 1,
    name: playerCount > 4 ? `Tour ${1}` : 'Demi-finales',
    matches: firstRoundMatches,
  })

  // Tours suivants
  for (let r = 2; r <= roundCount; r++) {
    const matchCount = Math.pow(2, roundCount - r)
    const roundMatches = []

    for (let m = 0; m < matchCount; m++) {
      roundMatches.push({
        match_id: `r${r}_m${m + 1}`,
        round: r,
        match_number: m + 1,
        player1: null,
        player2: null,
        winner: null,
        next_match_id: r < roundCount ? `r${r + 1}_m${Math.floor(m / 2) + 1}` : null,
      })
    }

    rounds.push({
      round: r,
      name: r === roundCount ? 'Finale' : (r === roundCount - 1 ? 'Demi-finales' : `Tour ${r}`),
      matches: roundMatches,
    })
  }

  return {
    format: 'single_elimination',
    rounds,
    total_rounds: roundCount,
    total_matches: bracketSize - 1,
  }
}

/**
 * Générer un bracket de double élimination (Double Elimination)
 *
 * @param {Array<string>} players - Liste des noms de joueurs
 * @returns {Object} Structure du bracket
 */
export const generateDoubleEliminationBracket = (players) => {
  // Winner bracket (identique à single elimination)
  const winnerBracket = generateSingleEliminationBracket(players)

  // Loser bracket
  const playerCount = players.length
  const roundCount = Math.ceil(Math.log2(playerCount))
  const loserRounds = []

  // Le loser bracket a 2 * (roundCount - 1) tours
  const loserRoundCount = 2 * (roundCount - 1)

  for (let r = 1; r <= loserRoundCount; r++) {
    const matchCount = Math.pow(2, Math.floor((loserRoundCount - r) / 2))
    const roundMatches = []

    for (let m = 0; m < matchCount; m++) {
      roundMatches.push({
        match_id: `lr${r}_m${m + 1}`,
        round: r,
        match_number: m + 1,
        player1: null,
        player2: null,
        winner: null,
        next_match_id: r < loserRoundCount ? `lr${r + 1}_m${Math.floor(m / 2) + 1}` : 'grand_final',
      })
    }

    loserRounds.push({
      round: r,
      name: `Loser Tour ${r}`,
      matches: roundMatches,
    })
  }

  // Grande finale
  const grandFinal = {
    round: loserRoundCount + 1,
    name: 'Grande Finale',
    matches: [{
      match_id: 'grand_final',
      round: loserRoundCount + 1,
      match_number: 1,
      player1: null, // Gagnant du winner bracket
      player2: null, // Gagnant du loser bracket
      winner: null,
      next_match_id: null,
    }],
  }

  return {
    format: 'double_elimination',
    winner_bracket: winnerBracket.rounds,
    loser_bracket: loserRounds,
    grand_final: grandFinal,
    total_rounds: roundCount + loserRoundCount + 1,
  }
}

/**
 * Générer un bracket round-robin (tous contre tous)
 *
 * @param {Array<string>} players - Liste des noms de joueurs
 * @returns {Object} Structure du bracket
 */
export const generateRoundRobinBracket = (players) => {
  const playerCount = players.length
  const rounds = []

  // Si nombre impair de joueurs, ajouter un "bye"
  const playersWithBye = playerCount % 2 === 0 ? [...players] : [...players, null]
  const n = playersWithBye.length

  // Algorithme round-robin standard
  for (let round = 1; round < n; round++) {
    const roundMatches = []

    for (let match = 0; match < n / 2; match++) {
      const player1Index = match
      const player2Index = n - 1 - match

      const player1 = playersWithBye[player1Index]
      const player2 = playersWithBye[player2Index]

      // Ne pas créer de match si un des joueurs est "bye"
      if (player1 !== null && player2 !== null) {
        roundMatches.push({
          match_id: `rr_r${round}_m${match + 1}`,
          round: round,
          match_number: match + 1,
          player1: player1,
          player2: player2,
          winner: null,
        })
      }
    }

    rounds.push({
      round: round,
      name: `Tour ${round}`,
      matches: roundMatches,
    })

    // Rotation des joueurs (le premier reste fixe)
    const last = playersWithBye.pop()
    playersWithBye.splice(1, 0, last)
  }

  return {
    format: 'round_robin',
    rounds,
    total_rounds: n - 1,
    total_matches: rounds.reduce((sum, r) => sum + r.matches.length, 0),
    standings: players.map(player => ({
      player,
      wins: 0,
      losses: 0,
      points: 0,
    })),
  }
}

/**
 * Générer un bracket de système suisse
 *
 * @param {Array<string>} players - Liste des noms de joueurs
 * @param {number} roundCount - Nombre de tours (optionnel, par défaut log2(n))
 * @returns {Object} Structure du bracket
 */
export const generateSwissBracket = (players, roundCount = null) => {
  const playerCount = players.length

  // Nombre de tours par défaut: log2(n) arrondi
  const defaultRounds = Math.ceil(Math.log2(playerCount))
  const totalRounds = roundCount || defaultRounds

  // Initialiser les standings
  const standings = players.map(player => ({
    player,
    wins: 0,
    losses: 0,
    points: 0,
    opponents: [],
  }))

  // Premier tour: appariement aléatoire ou par seed
  const firstRoundMatches = []
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5)

  for (let i = 0; i < playerCount / 2; i++) {
    firstRoundMatches.push({
      match_id: `sw_r1_m${i + 1}`,
      round: 1,
      match_number: i + 1,
      player1: shuffledPlayers[i * 2],
      player2: shuffledPlayers[i * 2 + 1],
      winner: null,
    })
  }

  const rounds = [{
    round: 1,
    name: 'Tour 1',
    matches: firstRoundMatches,
  }]

  // Tours suivants (générés dynamiquement en fonction des résultats)
  for (let r = 2; r <= totalRounds; r++) {
    rounds.push({
      round: r,
      name: `Tour ${r}`,
      matches: [], // Seront générés après les résultats du tour précédent
      status: 'pending',
    })
  }

  return {
    format: 'swiss',
    rounds,
    total_rounds: totalRounds,
    standings,
  }
}

/**
 * Générer les appariements pour le prochain tour du système suisse
 *
 * @param {Array<Object>} standings - Classement actuel
 * @param {number} roundNumber - Numéro du tour à générer
 * @returns {Array<Object>} Liste des matchs
 */
export const generateSwissRoundPairings = (standings, roundNumber) => {
  // Trier par points (puis par victoires si égalité)
  const sortedStandings = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return b.wins - a.wins
  })

  const matches = []
  const paired = new Set()

  // Apparier les joueurs de niveau similaire qui ne se sont pas encore rencontrés
  for (let i = 0; i < sortedStandings.length; i++) {
    if (paired.has(sortedStandings[i].player)) continue

    const player1 = sortedStandings[i]

    // Chercher un adversaire non rencontré
    for (let j = i + 1; j < sortedStandings.length; j++) {
      if (paired.has(sortedStandings[j].player)) continue

      const player2 = sortedStandings[j]

      // Vérifier qu'ils ne se sont pas déjà rencontrés
      if (!player1.opponents.includes(player2.player)) {
        matches.push({
          match_id: `sw_r${roundNumber}_m${matches.length + 1}`,
          round: roundNumber,
          match_number: matches.length + 1,
          player1: player1.player,
          player2: player2.player,
          winner: null,
        })

        paired.add(player1.player)
        paired.add(player2.player)
        break
      }
    }
  }

  // Gérer les joueurs restants (ceux qu'on n'a pas pu apparier idéalement ou le Bye)
  const unpaired = sortedStandings.filter(s => !paired.has(s.player))
  
  if (unpaired.length > 0) {
    // Appariement forcé pour les restants
    for (let i = 0; i < unpaired.length; i += 2) {
      const p1 = unpaired[i]
      const p2 = unpaired[i+1] // Peut être undefined si nombre impair (Bye)

      matches.push({
        match_id: `sw_r${roundNumber}_m${matches.length + 1}`,
        round: roundNumber,
        match_number: matches.length + 1,
        player1: p1.player,
        player2: p2 ? p2.player : null, // Bye si null
        winner: p2 ? null : p1.player, // Auto-win pour Bye
      })
    }
  }

  return matches
}

/**
 * Fonction utilitaire: obtenir le nom du format en français
 */
export const getFormatName = (format) => {
  // Normalize format to handle both dashes and underscores
  const normalizedFormat = format?.replace(/-/g, '_')

  const names = {
    single_elimination: 'Élimination Simple',
    double_elimination: 'Double Élimination',
    round_robin: 'Round-Robin (Poules)',
    swiss: 'Système Suisse',
  }
  return names[normalizedFormat] || format
}

/**
 * Fonction utilitaire: obtenir la description du format
 */
export const getFormatDescription = (format) => {
  // Normalize format to handle both dashes and underscores
  const normalizedFormat = format?.replace(/-/g, '_')

  const descriptions = {
    single_elimination: 'Une défaite = élimination. Format classique et rapide.',
    double_elimination: 'Deux défaites nécessaires pour être éliminé. Plus de matchs.',
    round_robin: 'Tous les joueurs s\'affrontent. Classement au nombre de victoires.',
    swiss: 'Appariements dynamiques selon les résultats. Équitable et efficace.',
  }
  return descriptions[normalizedFormat] || ''
}

/**
 * Fonction utilitaire: calculer le nombre de matchs pour un format
 */
export const calculateMatchCount = (format, playerCount) => {
  // Normalize format to handle both dashes and underscores
  const normalizedFormat = format?.replace(/-/g, '_')

  switch (normalizedFormat) {
    case 'single_elimination':
      return playerCount - 1

    case 'double_elimination':
      return (playerCount * 2) - 2

    case 'round_robin':
      return (playerCount * (playerCount - 1)) / 2

    case 'swiss': {
      const rounds = Math.ceil(Math.log2(playerCount))
      return Math.floor(playerCount / 2) * rounds
    }

    default:
      return 0
  }
}

export default {
  generateSingleEliminationBracket,
  generateDoubleEliminationBracket,
  generateRoundRobinBracket,
  generateSwissBracket,
  generateSwissRoundPairings,
  getFormatName,
  getFormatDescription,
  calculateMatchCount,
}
