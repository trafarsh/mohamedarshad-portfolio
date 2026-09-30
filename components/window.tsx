"use client"

import type React from "react"

import { useState } from "react"
import { X, Minus, Maximize2, Minimize2 } from "lucide-react"
import type { AppWindow } from "@/types"
import { DOCK_SPACE, MENUBAR_HEIGHT } from "@/lib/apps"
import Notes from "@/components/apps/notes"
import GitHub from "@/components/apps/github"
import Safari from "@/components/apps/safari"
import VSCode from "@/components/apps/vscode"
import FaceTime from "@/components/apps/facetime"
import Terminal from "@/components/apps/terminal"
import Mail from "@/components/apps/mail"
import YouTube from "@/components/apps/youtube"
import Spotify from "@/components/apps/spotify"
import Snake from "@/components/apps/snake"
import Weather from "@/components/apps/weather"
import Settings from "@/components/apps/settings"
import About from "@/components/apps/about"

export interface AppProps {
  isDarkMode: boolean
  // True while this app's window is focused (and not minimized)
  isActive?: boolean
}

const componentMap: Record<string, React.ComponentType<AppProps>> = {
  notes: Notes,
  github: GitHub,
  safari: Safari,
  vscode: VSCode,
  facetime: FaceTime,
  terminal: Terminal,
  mail: Mail,
  youtube: YouTube,
  spotify: Spotify,
  snake: Snake,
  weather: Weather,
  settings: Settings,
  about: About,
}

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"

const MIN_WIDTH = 320
const MIN_HEIGHT = 220

interface WindowProps {
  appWindow: AppWindow
  isActive: boolean
  isMinimized: boolean
  zIndex: number
  onClose: () => void
  onMinimize: () => void
  onFocus: () => void
  isDarkMode: boolean
}

export default function Window({
  appWindow,
  isActive,
  isMinimized,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
  isDarkMode,
}: WindowProps) {
  const [position, setPosition] = useState(appWindow.position)
  const [size, setSize] = useState(appWindow.size)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  // Animate size/position only for maximize/restore, never while dragging or resizing
  const [animateBounds, setAnimateBounds] = useState(false)

  const AppComponent = componentMap[appWindow.id]

  // Drag (mode "move") or resize the window. Uses pointer events so it also works on touch screens.
  const beginInteraction = (e: React.PointerEvent, mode: "move" | ResizeDirection) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    onFocus()

    const start = { px: e.clientX, py: e.clientY, ...position, ...size }
    setIsInteracting(true)

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - start.px
      const dy = ev.clientY - start.py
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (mode === "move") {
        setPosition({
          // Always keep part of the title bar on screen so the window can be grabbed again
          x: Math.min(Math.max(start.x + dx, 80 - start.width), viewportWidth - 80),
          y: Math.min(Math.max(start.y + dy, MENUBAR_HEIGHT), viewportHeight - 40),
        })
        return
      }

      let { x, y, width, height } = start

      if (mode.includes("e")) width = Math.max(MIN_WIDTH, start.width + dx)
      if (mode.includes("s")) height = Math.max(MIN_HEIGHT, start.height + dy)
      if (mode.includes("w")) {
        width = Math.max(MIN_WIDTH, start.width - dx)
        x = start.x + (start.width - width)
      }
      if (mode.includes("n")) {
        height = Math.max(MIN_HEIGHT, start.height - dy)
        y = start.y + (start.height - height)
        if (y < MENUBAR_HEIGHT) {
          height -= MENUBAR_HEIGHT - y
          y = MENUBAR_HEIGHT
        }
      }

      setSize({ width, height })
      setPosition({ x, y })
    }

    const handleUp = () => {
      setIsInteracting(false)
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
      window.removeEventListener("pointercancel", handleUp)
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    window.addEventListener("pointercancel", handleUp)
  }

  const handleTitleBarPointerDown = (e: React.PointerEvent) => {
    // Don't start dragging from the traffic-light buttons, or while maximized
    if ((e.target as HTMLElement).closest(".window-controls")) return
    if (isMaximized) {
      onFocus()
      return
    }
    beginInteraction(e, "move")
  }

  const toggleMaximize = () => {
    setAnimateBounds(true)
    setIsMaximized((value) => !value)
    setTimeout(() => setAnimateBounds(false), 250)
  }

  const titleBarClass = isDarkMode
    ? isActive
      ? "bg-gray-800"
      : "bg-gray-900"
    : isActive
      ? "bg-gray-200"
      : "bg-gray-100"

  const contentBgClass = isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
  const textClass = isDarkMode ? (isActive ? "text-white" : "text-gray-400") : isActive ? "text-gray-800" : "text-gray-500"

  const frameStyle: React.CSSProperties = isMaximized
    ? { left: 0, top: MENUBAR_HEIGHT, width: "100%", height: `calc(100% - ${MENUBAR_HEIGHT + DOCK_SPACE}px)` }
    : { left: position.x, top: position.y, width: size.width, height: size.height }

  // Inactive windows show grey traffic lights until hovered, like macOS
  const trafficLight = (activeColor: string, hoverColor: string) =>
    `w-3 h-3 rounded-full flex items-center justify-center ${isActive ? activeColor : "bg-gray-400/60"} ${hoverColor}`

  return (
    <section
      role="dialog"
      aria-label={appWindow.title}
      className={`absolute pointer-events-auto rounded-xl overflow-hidden border ${
        isDarkMode ? "border-white/10" : "border-black/10"
      } ${isActive ? "shadow-2xl" : "shadow-lg"} ${isMinimized ? "hidden" : ""} ${
        animateBounds ? "transition-[left,top,width,height] duration-200 ease-out" : ""
      } animate-in fade-in zoom-in-95`}
      style={{ ...frameStyle, zIndex }}
      onPointerDownCapture={onFocus}
    >
      {/* Title bar */}
      <div
        className={`h-8 flex items-center px-3 select-none touch-none ${titleBarClass}`}
        onPointerDown={handleTitleBarPointerDown}
        onDoubleClick={(e) => {
          if (!(e.target as HTMLElement).closest(".window-controls")) toggleMaximize()
        }}
      >
        <div className="window-controls group/controls flex items-center space-x-2 mr-4">
          <button className={trafficLight("bg-red-500", "group-hover/controls:bg-red-500")} onClick={onClose} aria-label={`Close ${appWindow.title}`}>
            <X className="w-2 h-2 text-red-900 opacity-0 group-hover/controls:opacity-100" strokeWidth={3} />
          </button>
          <button
            className={trafficLight("bg-yellow-500", "group-hover/controls:bg-yellow-500")}
            onClick={onMinimize}
            aria-label={`Minimize ${appWindow.title}`}
          >
            <Minus className="w-2 h-2 text-yellow-900 opacity-0 group-hover/controls:opacity-100" strokeWidth={3} />
          </button>
          <button
            className={trafficLight("bg-green-500", "group-hover/controls:bg-green-500")}
            onClick={toggleMaximize}
            aria-label={isMaximized ? `Restore ${appWindow.title}` : `Maximize ${appWindow.title}`}
          >
            {isMaximized ? (
              <Minimize2 className="w-2 h-2 text-green-900 opacity-0 group-hover/controls:opacity-100" strokeWidth={3} />
            ) : (
              <Maximize2 className="w-2 h-2 text-green-900 opacity-0 group-hover/controls:opacity-100" strokeWidth={3} />
            )}
          </button>
        </div>

        <div className={`flex-1 text-center text-sm font-medium truncate ${textClass}`}>{appWindow.title}</div>

        <div className="w-16">{/* Spacer to balance the title */}</div>
      </div>

      {/* Window content */}
      <div className={`${contentBgClass} relative h-[calc(100%-2rem)] overflow-auto`}>
        {AppComponent ? <AppComponent isDarkMode={isDarkMode} isActive={isActive && !isMinimized} /> : <div className="p-4">Content not available</div>}

        {/* Keeps iframes and other content from swallowing pointer events while dragging/resizing */}
        {isInteracting && <div className="absolute inset-0 z-30" />}
      </div>

      {/* Resize handles */}
      {!isMaximized && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-20 touch-none" onPointerDown={(e) => beginInteraction(e, "nw")} />
          <div className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize z-20 touch-none" onPointerDown={(e) => beginInteraction(e, "ne")} />
          <div className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-20 touch-none" onPointerDown={(e) => beginInteraction(e, "sw")} />
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20 touch-none" onPointerDown={(e) => beginInteraction(e, "se")} />
          <div className="absolute top-0 left-3 right-3 h-1 cursor-ns-resize z-20 touch-none" onPointerDown={(e) => beginInteraction(e, "n")} />
          <div className="absolute bottom-0 left-4 right-4 h-1.5 cursor-ns-resize z-20 touch-none" onPointerDown={(e) => beginInteraction(e, "s")} />
          <div className="absolute left-0 top-3 bottom-4 w-1.5 cursor-ew-resize z-20 touch-none" onPointerDown={(e) => beginInteraction(e, "w")} />
          <div className="absolute right-0 top-3 bottom-4 w-1.5 cursor-ew-resize z-20 touch-none" onPointerDown={(e) => beginInteraction(e, "e")} />
        </>
      )}
    </section>
  )
}
