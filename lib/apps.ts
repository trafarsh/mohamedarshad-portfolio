import type { AppWindow } from "@/types"

export interface AppDefinition {
  id: string
  title: string
  icon: string
  // Shown in the dock (every app is always available in Launchpad and Spotlight)
  inDock?: boolean
  // Hidden from Launchpad and Spotlight (opened from menus instead)
  hidden?: boolean
  defaultSize?: { width: number; height: number }
  keywords?: string[]
}

export const apps: AppDefinition[] = [
  { id: "safari", title: "Safari", icon: "/safari.png", inDock: true, keywords: ["projects", "browser", "links"] },
  { id: "mail", title: "Mail", icon: "/mail.png", inDock: true, keywords: ["contact", "email", "hire"] },
  { id: "vscode", title: "VS Code", icon: "/vscode.png", inDock: true, keywords: ["code", "source", "editor"] },
  { id: "notes", title: "Notes", icon: "/notes.png", inDock: true, keywords: ["about", "resume", "bio", "skills"] },
  { id: "facetime", title: "FaceTime", icon: "/facetime.png", inDock: true, keywords: ["camera", "photo"] },
  { id: "terminal", title: "Terminal", icon: "/terminal.png", inDock: true, keywords: ["shell", "cli", "command"] },
  { id: "github", title: "GitHub", icon: "/github.png", inDock: true, keywords: ["repos", "repositories", "code"] },
  { id: "youtube", title: "YouTube", icon: "/youtube.png", inDock: true, keywords: ["video"] },
  { id: "spotify", title: "Spotify", icon: "/spotify.png", inDock: true, keywords: ["music", "player", "song"] },
  { id: "snake", title: "Snake", icon: "/snake.png", defaultSize: { width: 520, height: 680 }, keywords: ["game"] },
  { id: "weather", title: "Weather", icon: "/weather.png", keywords: ["forecast", "temperature"] },
  {
    id: "settings",
    title: "System Settings",
    icon: "/settings.svg",
    defaultSize: { width: 760, height: 520 },
    keywords: ["preferences", "appearance", "dark mode", "wifi"],
  },
  {
    id: "about",
    title: "About This Mac",
    icon: "/settings.svg",
    hidden: true,
    defaultSize: { width: 420, height: 500 },
  },
]

export const LAUNCHPAD_ICON = "/launchpad.png"

export const MENUBAR_HEIGHT = 24
// Space kept free at the bottom of the screen for the dock
export const DOCK_SPACE = 88

export function getApp(id: string): AppDefinition | undefined {
  return apps.find((app) => app.id === id)
}

export const listedApps = apps.filter((app) => !app.hidden)
export const dockApps = apps.filter((app) => app.inDock)

// Builds a window that fits the current viewport, cascading each new window slightly.
export function createAppWindow(app: AppDefinition, openCount: number): AppWindow {
  const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth
  const viewportHeight = typeof window === "undefined" ? 800 : window.innerHeight
  const availableHeight = viewportHeight - MENUBAR_HEIGHT - DOCK_SPACE

  if (viewportWidth < 768) {
    return {
      id: app.id,
      title: app.title,
      position: { x: 8, y: MENUBAR_HEIGHT + 8 },
      size: { width: viewportWidth - 16, height: Math.max(240, availableHeight - 16) },
    }
  }

  const base = app.defaultSize ?? { width: 820, height: 600 }
  const width = Math.min(base.width, viewportWidth - 40)
  const height = Math.max(240, Math.min(base.height, availableHeight - 20))
  const offset = (openCount % 6) * 28 - 70

  const x = Math.round((viewportWidth - width) / 2 + offset)
  const y = Math.round(MENUBAR_HEIGHT + Math.max(10, (availableHeight - height) / 2) + offset / 2)

  return {
    id: app.id,
    title: app.title,
    position: {
      x: Math.min(Math.max(10, x), viewportWidth - width - 10),
      y: Math.max(MENUBAR_HEIGHT + 6, y),
    },
    size: { width, height },
  }
}
