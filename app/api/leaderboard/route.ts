import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET global leaderboard
export async function GET() {
  try {
    // Get all leaderboard entries across all tournaments
    const entries = await prisma.leaderboard.findMany({
      include: {
        player: true,
      },
    })

    // Aggregate stats by player
    const playerStats = new Map<
      string,
      {
        playerId: string
        playerName: string
        wins: number
        losses: number
        pointsFor: number
        pointsAgainst: number
        tournaments: number
      }
    >()

    for (const entry of entries) {
      const existing = playerStats.get(entry.playerId)
      if (existing) {
        existing.wins += entry.wins
        existing.losses += entry.losses
        existing.pointsFor += entry.pointsFor
        existing.pointsAgainst += entry.pointsAgainst
        existing.tournaments += 1
      } else {
        playerStats.set(entry.playerId, {
          playerId: entry.playerId,
          playerName: entry.player.name,
          wins: entry.wins,
          losses: entry.losses,
          pointsFor: entry.pointsFor,
          pointsAgainst: entry.pointsAgainst,
          tournaments: 1,
        })
      }
    }

    // Convert to array and sort by wins, then points differential
    const leaderboard = Array.from(playerStats.values())
      .map((stats) => ({
        ...stats,
        totalMatches: stats.wins + stats.losses,
        winPercentage: stats.wins + stats.losses > 0 ? (stats.wins / (stats.wins + stats.losses)) * 100 : 0,
        pointsDifferential: stats.pointsFor - stats.pointsAgainst,
      }))
      .sort((a, b) => {
        // Sort by wins first
        if (b.wins !== a.wins) return b.wins - a.wins
        // Then by points differential
        if (b.pointsDifferential !== a.pointsDifferential) return b.pointsDifferential - a.pointsDifferential
        // Then by points for
        return b.pointsFor - a.pointsFor
      })

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("[v0] Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
