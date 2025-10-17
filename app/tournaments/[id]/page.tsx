"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Trophy, Users, Target } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Player = {
  id: string
  name: string
}

type Match = {
  id: string
  matchNumber: number
  team1Player1: Player
  team1Player2: Player
  team1Score: number
  team2Player1: Player
  team2Player2: Player
  team2Score: number
  status: string
}

type LeaderboardEntry = {
  player: Player
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
}

type Tournament = {
  id: string
  name: string
  matchLength: number
  status: string
  players: Array<{
    player: Player
  }>
  matches: Match[]
  leaderboard: LeaderboardEntry[]
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: tournament, error, mutate } = useSWR<Tournament>(`/api/tournaments/${id}`, fetcher)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateMatches = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/tournaments/${id}/generate-matches`, {
        method: "POST",
      })

      if (response.ok) {
        mutate()
      }
    } catch (error) {
      console.error("[v0] Error generating matches:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-destructive">Failed to load tournament</div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  const completedMatches = tournament.matches.filter((m) => m.status === "completed").length

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link href="/tournaments">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{tournament.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {tournament.players.length} players
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {tournament.matchLength} points per match
              </span>
            </div>
          </div>
          {tournament.status === "completed" && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">Tournament Completed</div>
          )}
        </div>
      </div>

      {tournament.matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Matches not generated yet</p>
            <Button onClick={handleGenerateMatches} disabled={isGenerating}>
              {isGenerating ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Generate Matches
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Matches</CardTitle>
                <CardDescription>
                  {completedMatches} / {tournament.matches.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tournament.matches.map((match) => (
                  <MatchCard key={match.id} match={match} matchLength={tournament.matchLength} onUpdate={mutate} />
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Tournament standings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">W-L</TableHead>
                      <TableHead className="text-right">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tournament.leaderboard.map((entry, index) => (
                      <TableRow key={entry.player.id}>
                        <TableCell className="font-medium">
                          {index + 1}. {entry.player.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.wins}-{entry.losses}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.pointsFor}-{entry.pointsAgainst}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function MatchCard({
  match,
  matchLength,
  onUpdate,
}: {
  match: Match
  matchLength: number
  onUpdate: () => void
}) {
  const [team1Score, setTeam1Score] = useState(match.team1Score)
  const [team2Score, setTeam2Score] = useState(match.team2Score)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team1Score, team2Score }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("[v0] Error updating match:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = team1Score !== match.team1Score || team2Score !== match.team2Score
  const isCompleted = match.status === "completed"

  return (
    <Card className={isCompleted ? "border-green-200 bg-green-50/50" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-muted-foreground">Match {match.matchNumber}</span>
          {isCompleted && <span className="text-xs text-green-600 font-semibold">Completed</span>}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-semibold">
                {match.team1Player1.name} & {match.team1Player2.name}
              </div>
            </div>
            <Input
              type="number"
              min="0"
              max={matchLength}
              value={team1Score}
              onChange={(e) => setTeam1Score(Number.parseInt(e.target.value) || 0)}
              className="w-20 text-center"
              disabled={isCompleted}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-semibold">
                {match.team2Player1.name} & {match.team2Player2.name}
              </div>
            </div>
            <Input
              type="number"
              min="0"
              max={matchLength}
              value={team2Score}
              onChange={(e) => setTeam2Score(Number.parseInt(e.target.value) || 0)}
              className="w-20 text-center"
              disabled={isCompleted}
            />
          </div>
        </div>

        {!isCompleted && (
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="w-full mt-4" size="sm">
            {isSaving ? <Spinner className="h-4 w-4 mr-2" /> : null}
            Save Score
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
