"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Settings, X, Globe, ImageIcon, ExternalLink, AlertTriangle, Keyboard, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TabCloakSettings {
  enabled: boolean
  title: string
  favicon: string
  aboutBlankCloak: boolean
  aboutBlankTitle: string
  aboutBlankFavicon: string
  panicKey: string
  panicUrl: string
}

const DEFAULT_SETTINGS: TabCloakSettings = {
  enabled: false,
  title: "Google",
  favicon: "https://www.google.com/favicon.ico",
  aboutBlankCloak: false,
  aboutBlankTitle: "Google",
  aboutBlankFavicon: "https://www.google.com/favicon.ico",
  panicKey: "`",
  panicUrl: "https://classroom.google.com/",
}

const PRESET_CLOAKS = [
  { name: "Google", title: "Google", favicon: "https://www.google.com/favicon.ico" },
  {
    name: "Google Drive",
    title: "My Drive - Google Drive",
    favicon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png",
  },
  {
    name: "Google Docs",
    title: "Google Docs",
    favicon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
  },
  { name: "Gmail", title: "Gmail", favicon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" },
  { name: "YouTube", title: "YouTube", favicon: "https://www.youtube.com/favicon.ico" },
  {
    name: "Canvas",
    title: "Dashboard",
    favicon: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico",
  },
]

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<TabCloakSettings>(DEFAULT_SETTINGS)
  const [tempSettings, setTempSettings] = useState<TabCloakSettings>(DEFAULT_SETTINGS)
  const [isRecordingKey, setIsRecordingKey] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    const saved = localStorage.getItem("tabCloakSettings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings(parsed)
        setTempSettings(parsed)
        applyTabCloak(parsed)
      } catch (e) {
        console.error("Failed to load settings:", e)
      }
    }

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const initialTheme = savedTheme || "dark"
    setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  function applyTabCloak(settings: TabCloakSettings) {
    if (settings.enabled) {
      document.title = settings.title

      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
      if (!link) {
        link = document.createElement("link")
        link.rel = "icon"
        document.head.appendChild(link)
      }
      link.href = settings.favicon

      if (settings.aboutBlankCloak && window.parent === window) {
        const currentUrl = window.location.href
        const win = window.open("about:blank", "_blank")
        if (win) {
          win.document.title = settings.aboutBlankTitle

          const linkElement = win.document.createElement("link")
          linkElement.rel = "icon"
          linkElement.href = settings.aboutBlankFavicon
          win.document.head.appendChild(linkElement)

          const iframe = win.document.createElement("iframe")
          iframe.style.border = "none"
          iframe.style.width = "100%"
          iframe.style.height = "100%"
          iframe.style.margin = "0"
          iframe.style.position = "fixed"
          iframe.style.top = "0"
          iframe.style.left = "0"
          iframe.src = currentUrl
          win.document.body.style.margin = "0"
          win.document.body.appendChild(iframe)
          window.location.replace("https://www.google.com")
        }
      }
    } else {
      document.title = "FreePlay Arcade | Unblocked Games"
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
      if (link) {
        link.href = "/favicon.ico"
      }
    }
  }

  function handleSave() {
    setSettings(tempSettings)
    localStorage.setItem("tabCloakSettings", JSON.stringify(tempSettings))
    applyTabCloak(tempSettings)
    setIsOpen(false)
  }

  function handlePresetClick(preset: (typeof PRESET_CLOAKS)[0]) {
    setTempSettings({
      ...tempSettings,
      title: preset.title,
      favicon: preset.favicon,
    })
  }

  function handleReset() {
    setTempSettings(DEFAULT_SETTINGS)
  }

  function handleKeyRecording(e: React.KeyboardEvent) {
    e.preventDefault()
    setTempSettings({ ...tempSettings, panicKey: e.key })
    setIsRecordingKey(false)
  }

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="relative" aria-label="Settings">
        <Settings className="h-5 w-5" />
        {settings.enabled && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-background border border-border rounded-lg shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Settings</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Appearance</h3>
                    <p className="text-sm text-muted-foreground">Customize the look and feel</p>
                  </div>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={toggleTheme}
                    className="gap-2"
                  >
                    {theme === "dark" ? (
                      <>
                        <Moon className="h-4 w-4" />
                        Dark
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4" />
                        Light
                      </>
                    )}
                  </Button>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Tab Cloaking</h3>
                    <p className="text-sm text-muted-foreground">Disguise this tab to look like another website</p>
                  </div>
                  <Button
                    variant={tempSettings.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTempSettings({ ...tempSettings, enabled: !tempSettings.enabled })}
                  >
                    {tempSettings.enabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                {tempSettings.enabled && (
                  <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="tab-title" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Tab Title
                      </Label>
                      <Input
                        id="tab-title"
                        type="text"
                        value={tempSettings.title}
                        onChange={(e) => setTempSettings({ ...tempSettings, title: e.target.value })}
                        placeholder="Google"
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tab-favicon" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Favicon URL
                      </Label>
                      <Input
                        id="tab-favicon"
                        type="url"
                        value={tempSettings.favicon}
                        onChange={(e) => setTempSettings({ ...tempSettings, favicon: e.target.value })}
                        placeholder="https://www.google.com/favicon.ico"
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quick Presets</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {PRESET_CLOAKS.map((preset) => (
                          <Button
                            key={preset.name}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePresetClick(preset)}
                            className="justify-start gap-2"
                          >
                            <img
                              src={preset.favicon || "/placeholder.svg"}
                              alt=""
                              className="h-4 w-4"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                            {preset.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <Label htmlFor="about-blank" className="flex items-center gap-2 cursor-pointer">
                            <ExternalLink className="h-4 w-4" />
                            About:blank Cloak
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Opens site in about:blank window and redirects current tab to Google.
                            <strong className="text-amber-600"> Warning: This will close your current tab!</strong>
                          </p>
                        </div>
                        <input
                          id="about-blank"
                          type="checkbox"
                          checked={tempSettings.aboutBlankCloak}
                          onChange={(e) => setTempSettings({ ...tempSettings, aboutBlankCloak: e.target.checked })}
                          className="mt-1 h-4 w-4 cursor-pointer"
                        />
                      </div>

                      {tempSettings.aboutBlankCloak && (
                        <div className="space-y-3 pt-3 border-t border-amber-500/20">
                          <Label className="text-xs font-semibold">About:blank Window Appearance</Label>
                          <div className="space-y-2">
                            <Input
                              type="text"
                              value={tempSettings.aboutBlankTitle}
                              onChange={(e) => setTempSettings({ ...tempSettings, aboutBlankTitle: e.target.value })}
                              placeholder="About:blank window title"
                              className="bg-background text-sm"
                            />
                            <Input
                              type="url"
                              value={tempSettings.aboutBlankFavicon}
                              onChange={(e) => setTempSettings({ ...tempSettings, aboutBlankFavicon: e.target.value })}
                              placeholder="About:blank window favicon URL"
                              className="bg-background text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Panic Key
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quickly redirect to another website when a key is pressed
                  </p>
                </div>

                <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="panic-url" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Panic URL
                    </Label>
                    <Input
                      id="panic-url"
                      type="url"
                      value={tempSettings.panicUrl}
                      onChange={(e) => setTempSettings({ ...tempSettings, panicUrl: e.target.value })}
                      placeholder="https://classroom.google.com/"
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground">Website to redirect to when panic key is pressed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panic-key" className="flex items-center gap-2">
                      <Keyboard className="h-4 w-4" />
                      Panic Key
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="panic-key"
                        type="text"
                        value={tempSettings.panicKey}
                        readOnly
                        placeholder="Press a key..."
                        className="bg-background font-mono"
                      />
                      <Button
                        variant={isRecordingKey ? "default" : "outline"}
                        onClick={() => setIsRecordingKey(true)}
                        onKeyDown={isRecordingKey ? handleKeyRecording : undefined}
                        className="min-w-[100px]"
                      >
                        {isRecordingKey ? "Press key..." : "Change Key"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current key: <kbd className="px-2 py-1 bg-muted rounded border">{tempSettings.panicKey}</kbd>
                    </p>
                  </div>

                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-red-600">Note:</strong> The panic key will immediately redirect this tab
                      to the specified URL. Make sure the URL is correct!
                    </p>
                  </div>
                </div>
              </section>

              {tempSettings.enabled && (
                <section className="space-y-2">
                  <Label>Preview</Label>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-3 text-sm">
                      <img
                        src={tempSettings.favicon || "/placeholder.svg"}
                        alt=""
                        className="h-4 w-4"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                      <span className="font-medium">{tempSettings.title}</span>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border bg-background px-6 py-4 shrink-0">
              <Button variant="outline" onClick={handleReset}>
                Reset to Default
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
