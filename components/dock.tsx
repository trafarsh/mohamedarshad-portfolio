"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal } from "lucide-react"
import { dockApps, LAUNCHPAD_ICON } from "@/lib/apps"

const dockItems = [{ id: "launchpad", title: "Launchpad", icon: LAUNCHPAD_ICON }, ...dockApps]

type DockItem = (typeof dockItems)[number]

interface DockProps {
  onAppClick: (id: string) => void
  onLaunchpadClick: () => void
  openAppIds: string[]
  isDarkMode: boolean
}

export default function Dock({ onAppClick, onLaunchpadClick, openAppIds, isDarkMode }: DockProps) {
  const [mouseX, setMouseX] = useState<number | null>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [bouncingId, setBouncingId] = useState<string | null>(null)

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!showMobileMenu) return

    const handleClickOutside = (event: PointerEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false)
      }
    }

    document.addEventListener("pointerdown", handleClickOutside)
    return () => document.removeEventListener("pointerdown", handleClickOutside)
  }, [showMobileMenu])

  const handleAppClick = (app: DockItem) => {
    setShowMobileMenu(false)

    if (app.id === "launchpad") {
      onLaunchpadClick()
      return
    }

    // Bounce the icon when launching an app that isn't open yet
    if (!openAppIds.includes(app.id)) {
      setBouncingId(app.id)
      setTimeout(() => setBouncingId((current) => (current === app.id ? null : current)), 600)
    }

    onAppClick(app.id)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (barRef.current && !isMobile) {
      const rect = barRef.current.getBoundingClientRect()
      setMouseX(e.clientX - rect.left)
    }
  }

  // Calculate scale for each icon based on distance from mouse
  const getIconScale = (index: number, iconCount: number) => {
    if (mouseX === null || isMobile) return 1

    const dockWidth = barRef.current?.offsetWidth || 0
    const iconWidth = dockWidth / iconCount
    const iconPosition = iconWidth * (index + 0.5) // Center of the icon
    const distance = Math.abs(mouseX - iconPosition)

    const maxScale = 1.7
    const maxDistance = iconWidth * 2.5
    if (distance > maxDistance) return 1

    // Smooth parabolic scaling function
    return 1 + (maxScale - 1) * Math.pow(1 - distance / maxDistance, 2)
  }

  // For mobile, show only the first 4 apps plus a "more" button
  const visibleApps = isMobile ? dockItems.slice(0, 4) : dockItems
  const hiddenApps = isMobile ? dockItems.slice(4) : []

  const indicatorColor = isDarkMode ? "bg-white" : "bg-gray-800"

  return (
    <div ref={dockRef} className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-max max-w-[calc(100vw-1rem)]">
      {/* Mobile expanded menu */}
      {isMobile && showMobileMenu && (
        <div
          className={`absolute bottom-20 left-1/2 -translate-x-1/2 w-[300px]
          ${isDarkMode ? "bg-gray-800/90" : "bg-white/90"} backdrop-blur-xl
          rounded-2xl border border-white/20 shadow-lg p-4 animate-in fade-in slide-in-from-bottom-2 duration-200`}
        >
          <div className="grid grid-cols-4 gap-4">
            {hiddenApps.map((app) => (
              <button
                key={app.id}
                className="flex flex-col items-center justify-center"
                onClick={() => handleAppClick(app)}
              >
                <img src={app.icon} alt="" className="w-12 h-12 object-contain" draggable="false" />
                <span className={`text-[11px] mt-1 truncate max-w-full ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  {app.title}
                </span>
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${openAppIds.includes(app.id) ? indicatorColor : "bg-transparent"}`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main dock */}
      <div
        ref={barRef}
        role="toolbar"
        aria-label="Dock"
        className={`px-2 pt-2 pb-1.5 rounded-2xl
          ${isDarkMode ? "bg-white/10" : "bg-white/40"} backdrop-blur-2xl
          flex items-end border border-white/20 shadow-lg
          h-[68px]`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMouseX(null)}
      >
        {visibleApps.map((app, index) => {
          const scale = getIconScale(index, visibleApps.length)
          const isOpen = openAppIds.includes(app.id)

          return (
            <button
              key={app.id}
              aria-label={app.title}
              className={`relative flex flex-col items-center justify-end h-full shrink-0 ${isMobile ? "px-2" : "px-1.5"}`}
              style={{ zIndex: scale > 1 ? 10 : 1 }}
              onClick={() => handleAppClick(app)}
            >
              <div
                className="relative"
                style={{
                  transform: isMobile ? "none" : `translateY(${(scale - 1) * -10}px) scale(${scale})`,
                  transformOrigin: "bottom center",
                  transition: mouseX === null ? "transform 0.2s ease-out" : "transform 0.05s linear",
                }}
              >
                <img
                  src={app.icon}
                  alt=""
                  className={`object-contain w-12 h-12 ${
                    bouncingId === app.id ? "animate-bounce" : ""
                  }`}
                  draggable="false"
                />

                {/* Tooltip - only on desktop */}
                {!isMobile && scale > 1.45 && (
                  <div
                    className="absolute bottom-full left-1/2 mb-2 px-2 py-0.5 bg-gray-800/90 text-white text-[10px] rounded-md whitespace-nowrap pointer-events-none"
                    style={{ transform: `translateX(-50%) scale(${1 / scale})`, transformOrigin: "bottom center" }}
                  >
                    {app.title}
                  </div>
                )}
              </div>

              {/* Indicator dot for open apps */}
              <span className={`mt-0.5 w-1 h-1 rounded-full ${isOpen ? indicatorColor : "bg-transparent"}`} />
            </button>
          )
        })}

        {/* More button for mobile */}
        {isMobile && (
          <button
            aria-label="More apps"
            aria-expanded={showMobileMenu}
            className="flex flex-col items-center justify-end h-full px-2 pb-1.5 shrink-0"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                showMobileMenu ? "bg-blue-500/80" : isDarkMode ? "bg-gray-700/80" : "bg-white/70"
              }`}
            >
              <MoreHorizontal className={`w-7 h-7 ${isDarkMode || showMobileMenu ? "text-white" : "text-gray-800"}`} />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
