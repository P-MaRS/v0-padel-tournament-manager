"use client"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Plus, Users } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Tournament = {
  id: string
  name: string
  matchLength: number
  status: string
  createdAt: string
  players: Array<{
    player: {
      id: string
      name: string
    }
  }>
  matches: Array<{
    id: string
    status: string
  }>
}

export default function TournamentsPage() {
  const { data: tournaments, error } = useSWR<Tournament[]>("/api/tournaments", fetcher)

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-destructive">Failed to load tournaments</div>
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

  const activeTournaments = tournaments.filter((t) => t.status === "active")
  const completedTournaments = tournaments.filter((t) => t.status === "completed")

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="h-8 w-8" />
            Tournaments
          </h1>
          <p className="text-muted-foreground">Create and manage your padel tournaments</p>
        </div>
        <Link href="/tournaments/new">
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Tournament
          </Button>
        </Link>
      </div>

      {activeTournaments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Active Tournaments</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {activeTournaments.map((tournament) => (
              <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>{tournament.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {tournament.players.length} players
                        </span>
                        <span>{tournament.matchLength} points per match</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {tournament.matches.length === 0 ? (
                        <span className="text-amber-600">Matches not generated yet</span>
                      ) : (
                        <span>
                          {tournament.matches.filter((m) => m.status === "completed").length} /{" "}
                          {tournament.matches.length} matches completed
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {completedTournaments.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Completed Tournaments</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {completedTournaments.map((tournament) => (
              <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full opacity-75">
                  <CardHeader>
                    <CardTitle>{tournament.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {tournament.players.length} players
                        </span>
                        <span>{tournament.matchLength} points per match</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-green-600">Tournament completed</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tournaments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No tournaments yet. Create your first tournament!</p>
            <Link href="/tournaments/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
