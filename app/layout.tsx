import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { Trophy } from "lucide-react"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Padel Tournament Manager",
  description: "Organize and track your padel tournaments",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        <header className="border-b">
          <div className="container mx-auto px-6 py-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
              <Trophy className="h-6 w-6" />
              <span className="font-bold text-xl">Padel Tournament Manager</span>
            </Link>
          </div>
        </header>
        <main className="min-h-[calc(100vh-73px)]">{children}</main>
      </body>
    </html>
  )
}
