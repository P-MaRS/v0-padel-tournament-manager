import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET all players
export async function GET() {
  try {
    console.log("[v0] Fetching players from database...")
    const players = await prisma.player.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { tournaments: true },
        },
      },
    })
    console.log("[v0] Successfully fetched players:", players.length)
    return NextResponse.json(players)
  } catch (error) {
    console.error("[v0] Error fetching players:", error)
    console.error("[v0] Error name:", (error as Error).name)
    console.error("[v0] Error message:", (error as Error).message)
    console.error("[v0] Error stack:", (error as Error).stack)
    return NextResponse.json(
      {
        error: "Failed to fetch players",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

// POST create new player
export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    console.log("[v0] Creating player with name:", name)

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Player name is required" }, { status: 400 })
    }

    const player = await prisma.player.create({
      data: { name: name.trim() },
    })

    console.log("[v0] Successfully created player:", player.id)
    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating player:", error)
    console.error("[v0] Error details:", (error as Error).message)
    return NextResponse.json(
      {
        error: "Failed to create player",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
