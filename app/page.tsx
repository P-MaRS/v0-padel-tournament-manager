import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, BarChart3, History } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4">Padel Tournament Manager</h1>
        <p className="text-xl text-muted-foreground">Organize and track your padel tournaments with friends</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/players">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                Players
              </CardTitle>
              <CardDescription>Manage your player roster</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Add, view, and remove players from your roster</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tournaments">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Trophy className="h-6 w-6" />
                Tournaments
              </CardTitle>
              <CardDescription>Create and manage tournaments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Generate tournaments with automatic pairing</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/leaderboard">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6" />
                Leaderboard
              </CardTitle>
              <CardDescription>View global rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">See player statistics across all tournaments</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/history">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <History className="h-6 w-6" />
                History
              </CardTitle>
              <CardDescription>View past tournaments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Browse completed tournaments and results</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
