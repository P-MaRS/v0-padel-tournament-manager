"use client"

import useSWR from "swr"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { History, Trophy, Users, Calendar } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Player = {
  id: string
  name: string
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
  createdAt: string
  players: Array<{
    player: Player
  }>
  matches: Array<{
    id: string
    status: string
  }>
  leaderboard: LeaderboardEntry[]
}

export default function HistoryPage() {
  const { data: tournaments, error } = useSWR<Tournament[]>("/api/tournaments", fetcher)

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-destructive">Failed to load tournament history</div>
      </div>
    )
  }

  if (!tournaments) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  const completedTournaments = tournaments.filter((t) => t.status === "completed")

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <History className="h-8 w-8" />
          Tournament History
        </h1>
        <p className="text-muted-foreground">Browse past tournaments and results</p>
      </div>

      {completedTournaments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No completed tournaments yet. Finish a tournament to see it here!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {completedTournaments.map((tournament) => {
            const winner = tournament.leaderboard[0]
            const totalMatches = tournament.matches.length
            const date = new Date(tournament.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })

            return (
              <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{tournament.name}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {tournament.players.length} players
                          </span>
                          <span>{totalMatches} matches</span>
                        </CardDescription>
                      </div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-semibold">
                        Completed
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {winner && (
                      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                        <div>
                          <div className="font-semibold text-lg">{winner.player.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {winner.wins}-{winner.losses} ({winner.pointsFor}-{winner.pointsAgainst} points)
                          </div>
                        </div>
                      </div>
                    )}

                    {tournament.leaderboard.length > 1 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm font-semibold mb-2">Top 3 Players</div>
                        <div className="space-y-1">
                          {tournament.leaderboard.slice(0, 3).map((entry, index) => (
                            <div key={entry.player.id} className="flex items-center justify-between text-sm">
                              <span>
                                {index + 1}. {entry.player.name}
                              </span>
                              <span className="text-muted-foreground">
                                {entry.wins}-{entry.losses}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
