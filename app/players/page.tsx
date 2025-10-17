"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, UserPlus, Users } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

const MOCK_PLAYERS = [
  { id: "mock-1", name: "John Doe", createdAt: new Date().toISOString(), _count: { tournaments: 3 } },
  { id: "mock-2", name: "Jane Smith", createdAt: new Date().toISOString(), _count: { tournaments: 5 } },
  { id: "mock-3", name: "Mike Johnson", createdAt: new Date().toISOString(), _count: { tournaments: 2 } },
]

const fetcher = async (url: string) => {
  console.log("[v0] Fetching from:", url)
  const res = await fetch(url)
  console.log("[v0] Response status:", res.status)
  if (!res.ok) {
    const errorData = await res.json()
    console.error("[v0] API Error:", errorData)
    throw new Error(errorData.details || errorData.error || "Failed to fetch")
  }
  const data = await res.json()
  console.log("[v0] Received data:", data)
  return data
}

type Player = {
  id: string
  name: string
  createdAt: string
  _count: {
    tournaments: number
  }
}

export default function PlayersPage() {
  const [newPlayerName, setNewPlayerName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [useMockData, setUseMockData] = useState(false)
  const { data: players, error, mutate } = useSWR<Player[]>(useMockData ? null : "/api/players", fetcher)

  const displayPlayers = useMockData ? MOCK_PLAYERS : players

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlayerName.trim()) return

    setIsAdding(true)
    try {
      console.log("[v0] Adding player:", newPlayerName)
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlayerName }),
      })

      console.log("[v0] Add player response status:", response.status)
      if (response.ok) {
        setNewPlayerName("")
        mutate()
      } else {
        const errorData = await response.json()
        console.error("[v0] Failed to add player:", errorData)
        alert(`Failed to add player: ${errorData.details || errorData.error}`)
      }
    } catch (error) {
      console.error("[v0] Error adding player:", error)
      alert(`Error: ${(error as Error).message}`)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeletePlayer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this player?")) return

    try {
      console.log("[v0] Deleting player:", id)
      const response = await fetch(`/api/players/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        mutate()
      } else {
        const errorData = await response.json()
        console.error("[v0] Failed to delete player:", errorData)
      }
    } catch (error) {
      console.error("[v0] Error deleting player:", error)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center mb-4">
          <div className="text-destructive mb-4">Failed to load players: {error.message}</div>
          <Button onClick={() => setUseMockData(true)}>Use Mock Data to Test UI</Button>
        </div>
      </div>
    )
  }

  if (!displayPlayers && !useMockData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Users className="h-8 w-8" />
          Players
          {useMockData && <span className="text-sm font-normal text-muted-foreground">(Mock Data)</span>}
        </h1>
        <p className="text-muted-foreground">Manage your player roster for tournaments</p>
        <Button variant="outline" size="sm" onClick={() => setUseMockData(!useMockData)} className="mt-2">
          {useMockData ? "Try Real Data" : "Use Mock Data"}
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Player
          </CardTitle>
          <CardDescription>Add a player to your roster</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPlayer} className="flex gap-3">
            <Input
              type="text"
              placeholder="Player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              disabled={isAdding || useMockData}
              className="flex-1"
            />
            <Button type="submit" disabled={isAdding || !newPlayerName.trim() || useMockData}>
              {isAdding ? <Spinner className="h-4 w-4" /> : "Add Player"}
            </Button>
          </form>
          {useMockData && <p className="text-sm text-muted-foreground mt-2">Disabled in mock data mode</p>}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {displayPlayers && displayPlayers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No players yet. Add your first player above!
            </CardContent>
          </Card>
        ) : (
          displayPlayers?.map((player) => (
            <Card key={player.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{player.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {player._count.tournaments} tournament{player._count.tournaments !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeletePlayer(player.id)}
                  className="text-destructive hover:text-destructive"
                  disabled={useMockData}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
