"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Dock from "@/components/dock"
import Menubar from "@/components/menubar"
import Wallpaper from "@/components/wallpaper"
import Window from "@/components/window"
import Launchpad from "@/components/launchpad"
import ControlCenter from "@/components/control-center"
import Spotlight from "@/components/spotlight"
import DesktopIcons from "@/components/desktop-icons"
import { SystemProvider, readSetting, writeSetting, type SystemState } from "@/components/system-context"
import { createAppWindow, getApp } from "@/lib/apps"
import type { AppWindow } from "@/types"

interface DesktopProps {
  onLogout: () => void
  onSleep: () => void
  onShutdown: () => void
  onRestart: () => void
  isDarkMode: boolean
  onDarkModeChange: (value: boolean) => void
  brightness: number
  onBrightnessChange: (value: number) => void
}

type Overlay = "launchpad" | "spotlight" | "controlCenter" | null

export default function Desktop({
  onLogout,
  onSleep,
  onShutdown,
  onRestart,
  isDarkMode,
  onDarkModeChange,
  brightness,
  onBrightnessChange,
}: DesktopProps) {
  const [openWindows, setOpenWindows] = useState<AppWindow[]>([])
  // Window ids from bottom to top — the last one is drawn on top
  const [zOrder, setZOrder] = useState<string[]>([])
  const [minimizedIds, setMinimizedIds] = useState<string[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [wifiEnabled, setWifiEnabledState] = useState(true)
  const [volume, setVolumeState] = useState(75)

  useEffect(() => {
    const savedWifi = readSetting("wifiEnabled")
    if (savedWifi !== null) setWifiEnabledState(savedWifi === "true")

    const savedVolume = Number.parseInt(readSetting("volume") ?? "", 10)
    if (!Number.isNaN(savedVolume)) setVolumeState(Math.min(100, Math.max(0, savedVolume)))
  }, [])

  const setWifiEnabled = useCallback((value: boolean) => {
    setWifiEnabledState(value)
    writeSetting("wifiEnabled", value.toString())
  }, [])

  const setVolume = useCallback((value: number) => {
    setVolumeState(value)
    writeSetting("volume", value.toString())
  }, [])

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id)
    setZOrder((order) => (order[order.length - 1] === id ? order : [...order.filter((w) => w !== id), id]))
  }, [])

  // Picks the top-most visible window after one is closed or minimized
  const activateTopWindow = useCallback((order: string[], hidden: string[]) => {
    const next = [...order].reverse().find((id) => !hidden.includes(id))
    setActiveWindowId(next ?? null)
  }, [])

  const openApp = useCallback(
    (id: string) => {
      const app = getApp(id)
      if (!app) return

      setOverlay(null)
      setOpenWindows((windows) =>
        windows.some((w) => w.id === id) ? windows : [...windows, createAppWindow(app, windows.length)],
      )
      setMinimizedIds((ids) => ids.filter((w) => w !== id))
      focusWindow(id)
    },
    [focusWindow],
  )

  const closeWindow = (id: string) => {
    const remainingOrder = zOrder.filter((w) => w !== id)
    const remainingMinimized = minimizedIds.filter((w) => w !== id)
    setOpenWindows((windows) => windows.filter((w) => w.id !== id))
    setZOrder(remainingOrder)
    setMinimizedIds(remainingMinimized)
    if (activeWindowId === id) activateTopWindow(remainingOrder, remainingMinimized)
  }

  const minimizeWindow = (id: string) => {
    const hidden = [...minimizedIds, id]
    setMinimizedIds(hidden)
    if (activeWindowId === id) activateTopWindow(zOrder, hidden)
  }

  const toggleOverlay = (name: Exclude<Overlay, null>) => setOverlay((current) => (current === name ? null : name))

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isSpotlightShortcut =
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.ctrlKey && e.code === "Space")

      if (isSpotlightShortcut) {
        e.preventDefault()
        setOverlay((current) => (current === "spotlight" ? null : "spotlight"))
      } else if (e.key === "Escape") {
        setOverlay(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleBackgroundClick = () => {
    setActiveWindowId(null)
    setOverlay(null)
  }

  const system = useMemo<SystemState>(
    () => ({
      isDarkMode,
      toggleDarkMode: () => onDarkModeChange(!isDarkMode),
      setDarkMode: onDarkModeChange,
      brightness,
      setBrightness: onBrightnessChange,
      wifiEnabled,
      setWifiEnabled,
      volume,
      setVolume,
      openApp,
    }),
    [isDarkMode, onDarkModeChange, brightness, onBrightnessChange, wifiEnabled, setWifiEnabled, volume, setVolume, openApp],
  )

  const activeWindow = openWindows.find((w) => w.id === activeWindowId) ?? null

  return (
    <SystemProvider value={system}>
      <div className={`relative h-full w-full overflow-hidden ${isDarkMode ? "dark" : ""}`}>
        <Wallpaper isDarkMode={isDarkMode} onClick={handleBackgroundClick} />

        <DesktopIcons onOpen={openApp} />

        <Menubar
          onLogout={onLogout}
          onSleep={onSleep}
          onShutdown={onShutdown}
          onRestart={onRestart}
          onSpotlightClick={() => toggleOverlay("spotlight")}
          onControlCenterClick={() => toggleOverlay("controlCenter")}
          onOpenApp={openApp}
          onCloseWindow={closeWindow}
          onMinimizeWindow={minimizeWindow}
          activeWindow={activeWindow}
        />

        {/* Windows layer: only the windows themselves catch clicks, so the wallpaper stays clickable */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {openWindows.map((appWindow) => (
            <Window
              key={appWindow.id}
              appWindow={appWindow}
              isActive={activeWindowId === appWindow.id}
              isMinimized={minimizedIds.includes(appWindow.id)}
              zIndex={zOrder.indexOf(appWindow.id) + 1}
              onClose={() => closeWindow(appWindow.id)}
              onMinimize={() => minimizeWindow(appWindow.id)}
              onFocus={() => focusWindow(appWindow.id)}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>

        {overlay === "launchpad" && <Launchpad onAppClick={openApp} onClose={() => setOverlay(null)} />}

        {overlay === "controlCenter" && <ControlCenter onClose={() => setOverlay(null)} />}

        {overlay === "spotlight" && <Spotlight onClose={() => setOverlay(null)} onAppClick={openApp} />}

        <Dock
          onAppClick={openApp}
          onLaunchpadClick={() => toggleOverlay("launchpad")}
          openAppIds={openWindows.map((w) => w.id)}
          isDarkMode={isDarkMode}
        />
      </div>
    </SystemProvider>
  )
}
