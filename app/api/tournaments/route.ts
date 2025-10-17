import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET all tournaments
export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        players: {
          include: {
            player: true,
          },
        },
        matches: {
          include: {
            team1Player1: true,
            team1Player2: true,
            team2Player1: true,
            team2Player2: true,
          },
        },
      },
    })
    return NextResponse.json(tournaments)
  } catch (error) {
    console.error("[v0] Error fetching tournaments:", error)
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 })
  }
}

// POST create new tournament
export async function POST(request: Request) {
  try {
    const { name, matchLength, playerIds } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Tournament name is required" }, { status: 400 })
    }

    if (!playerIds || playerIds.length < 4) {
      return NextResponse.json({ error: "At least 4 players are required" }, { status: 400 })
    }

    if (![8, 16, 32].includes(matchLength)) {
      return NextResponse.json({ error: "Match length must be 8, 16, or 32" }, { status: 400 })
    }

    // Create tournament with players
    const tournament = await prisma.tournament.create({
      data: {
        name: name.trim(),
        matchLength,
        players: {
          create: playerIds.map((playerId: string) => ({
            playerId,
          })),
        },
      },
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    })

    return NextResponse.json(tournament, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating tournament:", error)
    return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 })
  }
}
