"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2 } from "lucide-react"

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

interface GameCardProps {
  game: Game
  coverUrl: string
  onClick: () => void
  featured?: boolean
}

export default function GameCard({ game, coverUrl, onClick, featured }: GameCardProps) {
  const [imageError, setImageError] = useState(false)
  const coverImage = game.image || `${coverUrl}/${game.id}.png`

  return (
    <Card
      onClick={onClick}
      className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:bg-card-hover hover:border-primary/50 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {!imageError ? (
          <img
            src={coverImage || "/placeholder.svg"}
            alt={game.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Gamepad2 className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {featured && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground border-0">Featured</Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {game.name}
        </h3>
        {(game.developer || game.author) && (
          <p className="text-xs text-muted-foreground line-clamp-1">by {game.developer || game.author}</p>
        )}
        {game.category && <p className="text-xs text-muted-foreground/70 mt-1">{game.category}</p>}
      </div>
    </Card>
  )
}
