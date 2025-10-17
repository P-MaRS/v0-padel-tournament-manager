import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// PATCH update match score
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { team1Score, team2Score } = await request.json()

    if (typeof team1Score !== "number" || typeof team2Score !== "number") {
      return NextResponse.json({ error: "Invalid scores" }, { status: 400 })
    }

    if (team1Score < 0 || team2Score < 0) {
      return NextResponse.json({ error: "Scores must be non-negative" }, { status: 400 })
    }

    // Get the match with tournament info
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        tournament: true,
      },
    })

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Determine if match is completed (one team reached match length)
    const isCompleted = team1Score >= match.tournament.matchLength || team2Score >= match.tournament.matchLength

    // Update match
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        team1Score,
        team2Score,
        status: isCompleted ? "completed" : "pending",
      },
    })

    // If match is completed, update leaderboard
    if (isCompleted) {
      const team1Won = team1Score > team2Score
      const team1Players = [match.team1Player1Id, match.team1Player2Id]
      const team2Players = [match.team2Player1Id, match.team2Player2Id]

      // Update leaderboard for team 1 players
      for (const playerId of team1Players) {
        await prisma.leaderboard.update({
          where: {
            tournamentId_playerId: {
              tournamentId: match.tournamentId,
              playerId,
            },
          },
          data: {
            wins: team1Won ? { increment: 1 } : undefined,
            losses: !team1Won ? { increment: 1 } : undefined,
            pointsFor: { increment: team1Score },
            pointsAgainst: { increment: team2Score },
          },
        })
      }

      // Update leaderboard for team 2 players
      for (const playerId of team2Players) {
        await prisma.leaderboard.update({
          where: {
            tournamentId_playerId: {
              tournamentId: match.tournamentId,
              playerId,
            },
          },
          data: {
            wins: !team1Won ? { increment: 1 } : undefined,
            losses: team1Won ? { increment: 1 } : undefined,
            pointsFor: { increment: team2Score },
            pointsAgainst: { increment: team1Score },
          },
        })
      }

      // Check if all matches are completed
      const totalMatches = await prisma.match.count({
        where: { tournamentId: match.tournamentId },
      })

      const completedMatches = await prisma.match.count({
        where: {
          tournamentId: match.tournamentId,
          status: "completed",
        },
      })

      // If all matches completed, mark tournament as completed
      if (totalMatches === completedMatches) {
        await prisma.tournament.update({
          where: { id: match.tournamentId },
          data: { status: "completed" },
        })
      }
    }

    return NextResponse.json(updatedMatch)
  } catch (error) {
    console.error("[v0] Error updating match:", error)
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 })
  }
}
