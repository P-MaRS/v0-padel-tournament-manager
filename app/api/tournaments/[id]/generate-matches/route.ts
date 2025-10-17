import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateTournamentMatches } from "@/lib/pairing-algorithm"

// POST generate matches for tournament
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get tournament with players
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }

    // Check if matches already exist
    const existingMatches = await prisma.match.count({
      where: { tournamentId: id },
    })

    if (existingMatches > 0) {
      return NextResponse.json({ error: "Matches already generated for this tournament" }, { status: 400 })
    }

    // Generate matches using pairing algorithm
    const players = tournament.players.map((tp) => tp.player)
    const matches = generateTournamentMatches(players)

    // Create matches in database
    await prisma.match.createMany({
      data: matches.map((match) => ({
        tournamentId: id,
        matchNumber: match.matchNumber,
        team1Player1Id: match.team1[0].id,
        team1Player2Id: match.team1[1].id,
        team2Player1Id: match.team2[0].id,
        team2Player2Id: match.team2[1].id,
      })),
    })

    // Initialize leaderboard entries for all players
    await prisma.leaderboard.createMany({
      data: players.map((player) => ({
        tournamentId: id,
        playerId: player.id,
      })),
    })

    return NextResponse.json({ success: true, matchCount: matches.length })
  } catch (error) {
    console.error("[v0] Error generating matches:", error)
    return NextResponse.json({ error: "Failed to generate matches" }, { status: 500 })
  }
}
