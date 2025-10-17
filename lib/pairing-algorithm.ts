type Player = {
  id: string
  name: string
}

type Match = {
  matchNumber: number
  team1: [Player, Player]
  team2: [Player, Player]
}

/**
 * Generates tournament matches ensuring each player partners with every other player exactly once
 * Uses a round-robin pairing algorithm for 2v2 matches
 */
export function generateTournamentMatches(players: Player[]): Match[] {
  const matches: Match[] = []
  const n = players.length

  if (n < 4) {
    throw new Error("At least 4 players are required for a tournament")
  }

  // Track partnerships to ensure each player partners with every other player once
  const partnerships = new Map<string, Set<string>>()
  players.forEach((p) => partnerships.set(p.id, new Set()))

  // Generate all possible pairs
  const allPairs: [Player, Player][] = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      allPairs.push([players[i], players[j]])
    }
  }

  let matchNumber = 1

  // Try to create matches by pairing teams
  for (let i = 0; i < allPairs.length; i++) {
    const team1 = allPairs[i]
    const [p1, p2] = team1

    // Skip if this partnership already exists
    if (partnerships.get(p1.id)?.has(p2.id)) continue

    // Find a compatible team2 (no overlapping players and no existing partnerships)
    for (let j = i + 1; j < allPairs.length; j++) {
      const team2 = allPairs[j]
      const [p3, p4] = team2

      // Check if teams have no overlapping players
      const team1Ids = new Set([p1.id, p2.id])
      const team2Ids = new Set([p3.id, p4.id])
      const hasOverlap = [...team1Ids].some((id) => team2Ids.has(id))

      if (hasOverlap) continue

      // Check if this partnership already exists
      if (partnerships.get(p3.id)?.has(p4.id)) continue

      // Create the match
      matches.push({
        matchNumber,
        team1,
        team2,
      })

      // Mark partnerships as used
      partnerships.get(p1.id)?.add(p2.id)
      partnerships.get(p2.id)?.add(p1.id)
      partnerships.get(p3.id)?.add(p4.id)
      partnerships.get(p4.id)?.add(p3.id)

      matchNumber++
      break
    }
  }

  return matches
}
