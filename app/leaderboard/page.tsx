"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, Trophy, TrendingUp } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type LeaderboardEntry = {
  playerId: string
  playerName: string
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  tournaments: number
  totalMatches: number
  winPercentage: number
  pointsDifferential: number
}

export default function LeaderboardPage() {
  const { data: leaderboard, error } = useSWR<LeaderboardEntry[]>("/api/leaderboard", fetcher)

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-destructive">Failed to load leaderboard</div>
      </div>
    )
  }

  if (!leaderboard) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  const topThree = leaderboard.slice(0, 3)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          Global Leaderboard
        </h1>
        <p className="text-muted-foreground">Player statistics across all tournaments</p>
      </div>

      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No tournament data yet. Complete some matches to see the leaderboard!
          </CardContent>
        </Card>
      ) : (
        <>
          {topThree.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {topThree.map((entry, index) => (
                <Card key={entry.playerId} className={index === 0 ? "border-yellow-400 bg-yellow-50/50" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {index === 0 && <Trophy className="h-5 w-5 text-yellow-600" />}
                      {index === 1 && <Trophy className="h-5 w-5 text-gray-400" />}
                      {index === 2 && <Trophy className="h-5 w-5 text-amber-700" />}
                      <span className="text-lg">
                        #{index + 1} {entry.playerName}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {entry.wins}-{entry.losses} ({entry.winPercentage.toFixed(1)}% win rate)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        {entry.pointsFor}-{entry.pointsAgainst} points
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Players</CardTitle>
              <CardDescription>Complete rankings and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Tournaments</TableHead>
                    <TableHead className="text-right">Matches</TableHead>
                    <TableHead className="text-right">W-L</TableHead>
                    <TableHead className="text-right">Win %</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Diff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow key={entry.playerId}>
                      <TableCell className="font-bold">{index + 1}</TableCell>
                      <TableCell className="font-semibold">{entry.playerName}</TableCell>
                      <TableCell className="text-right">{entry.tournaments}</TableCell>
                      <TableCell className="text-right">{entry.totalMatches}</TableCell>
                      <TableCell className="text-right">
                        {entry.wins}-{entry.losses}
                      </TableCell>
                      <TableCell className="text-right">{entry.winPercentage.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">
                        {entry.pointsFor}-{entry.pointsAgainst}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${entry.pointsDifferential >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {entry.pointsDifferential >= 0 ? "+" : ""}
                        {entry.pointsDifferential}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
