"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import GameCard from "@/components/game-card"
import GameViewer from "@/components/game-viewer"
import SettingsMenu from "@/components/settings-menu"

interface Game {
  id: number
  name: string
  author?: string
  developer?: string
  category?: string
  url: string
  image?: string
  featured?: boolean
}

const ZONES_URLS = [
  "https://cdn.jsdelivr.net/gh/gn-math/assets@main/zones.json",
  "https://cdn.jsdelivr.net/gh/gn-math/assets@latest/zones.json",
  "https://cdn.jsdelivr.net/gh/gn-math/assets@master/zones.json",
  "https://cdn.jsdelivr.net/gh/gn-math/assets/zones.json",
]

const COVER_URL = "https://cdn.jsdelivr.net/gh/gn-math/covers@main"
const HTML_URL = "https://cdn.jsdelivr.net/gh/gn-math/html@main"

export default function GameBrowser() {
  const [games, setGames] = useState<Game[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "id" | "popular">("name")
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [popularityData, setPopularityData] = useState<Record<number, number>>({})

  useEffect(() => {
    loadGames()
  }, [])

  async function loadGames() {
    try {
      let cdnGames: Game[] = []
      let oddGames: any[] = []

      // Load CDN games (original 547 games)
      let zonesURL = ZONES_URLS[0]
      try {
        const shaResponse = await fetch(`https://api.github.com/repos/gn-math/assets/commits?t=${Date.now()}`)
        if (shaResponse.ok) {
          const shaJson = await shaResponse.json()
          const sha = shaJson[0]?.sha
          if (sha) {
            zonesURL = `https://cdn.jsdelivr.net/gh/gn-math/assets@${sha}/zones.json`
          }
        }
      } catch (error) {
        console.log("Could not fetch SHA, using default URL")
      }

      const cdnResponse = await fetch(`${zonesURL}?t=${Date.now()}`)
      if (cdnResponse.ok) {
        cdnGames = await cdnResponse.json()
      }

      try {
        const oddResponse = await fetch(`/oddgames.json?t=${Date.now()}`)
        if (oddResponse.ok) {
          const oddData = await oddResponse.json()
          oddGames = oddData.zones || []
        }
      } catch (error) {
        console.log("No oddgames found, using CDN games only")
      }

      // Merge games, removing duplicates by ID
      const gameMap = new Map<number, Game>()

      // Add CDN games first
      cdnGames.forEach((game) => {
        if (game.id !== -1) {
          // Skip suggested games
          gameMap.set(game.id, game)
        }
      })

      oddGames.forEach((game) => {
        if (game.id !== -1) {
          // Skip suggested games
          gameMap.set(game.id, game)
        }
      })

      const mergedGames = Array.from(gameMap.values())

      // Mark first game as featured (1v1.LOL)
      if (mergedGames.length > 0) {
        mergedGames[0].featured = true
      }

      setGames(mergedGames)

      // Fetch popularity data
      fetchPopularity()
    } catch (error) {
      console.error("Error loading games:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPopularity() {
    try {
      const response = await fetch("https://data.jsdelivr.com/v1/stats/packages/gh/gn-math/html@main/files?period=year")
      const data = await response.json()
      const popularity: Record<number, number> = {}

      data.forEach((file: any) => {
        const idMatch = file.name.match(/\/(\d+)\.html$/)
        if (idMatch) {
          const id = Number.parseInt(idMatch[1])
          popularity[id] = file.hits.total
        }
      })

      setPopularityData(popularity)
    } catch (error) {
      console.log("Could not fetch popularity data")
    }
  }

  useEffect(() => {
    function handlePanicKey(e: KeyboardEvent) {
      const settings = localStorage.getItem("tabCloakSettings")
      if (settings) {
        try {
          const parsed = JSON.parse(settings)
          if (e.key === parsed.panicKey && parsed.panicUrl) {
            e.preventDefault()
            window.location.href = parsed.panicUrl
          }
        } catch (error) {
          console.error("Failed to parse panic key settings:", error)
        }
      }
    }

    window.addEventListener("keydown", handlePanicKey)
    return () => window.removeEventListener("keydown", handlePanicKey)
  }, [])

  const filteredAndSortedGames = useMemo(() => {
    const filtered = games
      .filter((game) => game.id !== -1) // Remove suggested games
      .filter(
        (game) =>
          game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.developer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.category?.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "id":
          return a.id - b.id
        case "popular":
          return (popularityData[b.id] || 0) - (popularityData[a.id] || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [games, searchQuery, sortBy, popularityData])

  const featuredGames = useMemo(() => filteredAndSortedGames.filter((g) => g.featured), [filteredAndSortedGames])

  const regularGames = useMemo(() => filteredAndSortedGames.filter((g) => !g.featured), [filteredAndSortedGames])

  function handleGameClick(game: Game) {
    setSelectedGame(game)
  }

  function handleCloseGame() {
    setSelectedGame(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 animate-slide-in">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                <span className="text-xl font-bold text-primary-foreground">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  FreePlay Arcade
                </h1>
                <p className="text-xs text-muted-foreground">Escape the ordinary</p>
              </div>
            </div>

            <div className="flex flex-1 gap-3 md:max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border transition-all focus:border-primary"
                />
              </div>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[140px] bg-input border-border">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="id">ID</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>

              <SettingsMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading games...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>{filteredAndSortedGames.length} games available</span>
            </div>

            {/* Featured Games */}
            {featuredGames.length > 0 && (
              <section className="mb-12 animate-fade-in">
                <h2 className="mb-4 text-2xl font-bold tracking-tight">Featured</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {featuredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      coverUrl={COVER_URL}
                      onClick={() => handleGameClick(game)}
                      featured
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Games */}
            <section className="animate-fade-in">
              <h2 className="mb-4 text-2xl font-bold tracking-tight">All Games</h2>
              {regularGames.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground">No games found matching your search.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {regularGames.map((game) => (
                    <GameCard key={game.id} game={game} coverUrl={COVER_URL} onClick={() => handleGameClick(game)} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Game Viewer Modal */}
      {selectedGame && (
        <GameViewer game={selectedGame} coverUrl={COVER_URL} htmlUrl={HTML_URL} onClose={handleCloseGame} />
      )}
    </div>
  )
}
