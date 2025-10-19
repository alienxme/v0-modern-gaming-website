"use client"

import { useEffect, useRef, useState } from "react"
import { X, Maximize2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Game {
  id: number
  name: string
  author?: string
  url: string
}

interface GameViewerProps {
  game: Game
  coverUrl: string
  htmlUrl: string
  onClose: () => void
}

export default function GameViewer({ game, coverUrl, htmlUrl, onClose }: GameViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const gameUrl = game.url.startsWith("http")
    ? game.url
    : game.url.replace("{COVER_URL}", coverUrl).replace("{HTML_URL}", htmlUrl).replace("{id}", game.id.toString())

  useEffect(() => {
    const fetchGameHtml = async () => {
      // Only fetch for CDN games (gn-math), not for direct URLs or oddgames
      if (gameUrl.includes("cdn.jsdelivr.net") || gameUrl.includes("jsdelivr.net")) {
        try {
          const response = await fetch(gameUrl)
          const html = await response.text()
          setHtmlContent(html)
        } catch (error) {
          console.error("[v0] Error fetching game HTML:", error)
        }
      }
      setIsLoading(false)
    }

    fetchGameHtml()
  }, [gameUrl])

  useEffect(() => {
    // Prevent body scroll when viewer is open
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (!document.fullscreenElement) {
        iframeRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const handleOpenNewTab = () => {
    window.open(gameUrl, "_blank")
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground line-clamp-1">{game.name}</h2>
              {game.author && <p className="text-sm text-muted-foreground">by {game.author}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleFullscreen} title="Fullscreen">
                <Maximize2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleOpenNewTab} title="Open in new tab">
                <ExternalLink className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} title="Close (Esc)">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Game iframe */}
      <div className="h-full w-full pt-[73px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground">Loading game...</div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            {...(htmlContent ? { srcDoc: htmlContent } : { src: gameUrl })}
            className="h-full w-full border-0"
            title={game.name}
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
      </div>
    </div>
  )
}
