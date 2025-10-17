"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Player = {
  id: string
  name: string
}

export default function NewTournamentPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [matchLength, setMatchLength] = useState(16)
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const { data: players } = useSWR<Player[]>("/api/players", fetcher)

  const handlePlayerToggle = (playerId: string) => {
    const newSelected = new Set(selectedPlayers)
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId)
    } else {
      newSelected.add(playerId)
    }
    setSelectedPlayers(newSelected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Tournament name is required")
      return
    }

    if (selectedPlayers.size < 4) {
      setError("At least 4 players are required")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          matchLength,
          playerIds: Array.from(selectedPlayers),
        }),
      })

      if (response.ok) {
        const tournament = await response.json()
        router.push(`/tournaments/${tournament.id}`)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create tournament")
      }
    } catch (err) {
      setError("Failed to create tournament")
    } finally {
      setIsCreating(false)
    }
  }

  if (!players) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Link href="/tournaments">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </Button>
      </Link>

      <h1 className="text-4xl font-bold mb-8">Create New Tournament</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tournament Details</CardTitle>
            <CardDescription>Set up your tournament configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Summer Championship 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div>
              <Label htmlFor="matchLength">Match Length (points)</Label>
              <div className="flex gap-2 mt-2">
                {[8, 16, 32].map((length) => (
                  <Button
                    key={length}
                    type="button"
                    variant={matchLength === length ? "default" : "outline"}
                    onClick={() => setMatchLength(length)}
                    disabled={isCreating}
                  >
                    {length}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Players</CardTitle>
            <CardDescription>Choose at least 4 players ({selectedPlayers.size} selected)</CardDescription>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">No players available. Add players first!</p>
                <Link href="/players">
                  <Button variant="outline">Go to Players</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={player.id}
                      checked={selectedPlayers.has(player.id)}
                      onCheckedChange={() => handlePlayerToggle(player.id)}
                      disabled={isCreating}
                    />
                    <Label htmlFor={player.id} className="cursor-pointer flex-1">
                      {player.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {error && <div className="text-destructive text-sm">{error}</div>}

        <Button type="submit" size="lg" className="w-full" disabled={isCreating || players.length === 0}>
          {isCreating ? <Spinner className="h-4 w-4 mr-2" /> : null}
          Create Tournament
        </Button>
      </form>
    </div>
  )
}
