"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { listedApps } from "@/lib/apps"

interface LaunchpadProps {
  onAppClick: (id: string) => void
  onClose: () => void
}

export default function Launchpad({ onAppClick, onClose }: LaunchpadProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    // Fade in on the next frame so the transition runs
    const frame = requestAnimationFrame(() => setIsVisible(true))
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(closeTimer.current)
    }
  }, [])

  const query = searchTerm.trim().toLowerCase()
  const filteredApps = query
    ? listedApps.filter(
        (app) => app.title.toLowerCase().includes(query) || app.keywords?.some((keyword) => keyword.includes(query)),
      )
    : listedApps

  const handleClose = () => {
    setIsVisible(false)
    closeTimer.current = setTimeout(onClose, 250) // Wait for animation to complete
  }

  return (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-xl z-40 flex flex-col items-center justify-start sm:justify-center overflow-y-auto
        transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-4xl px-6 sm:px-8 pt-12 pb-28 transition-transform duration-300
          ${isVisible ? "scale-100" : "scale-110"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-64 mx-auto mb-10 sm:mb-12">
          <input
            type="text"
            placeholder="Search"
            aria-label="Search apps"
            autoFocus
            className="w-full bg-white/20 backdrop-blur-md text-white placeholder:text-white/60 border border-white/20 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredApps[0]) onAppClick(filteredApps[0].id)
            }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-6 sm:gap-8">
          {filteredApps.map((app) => (
            <button
              key={app.id}
              className="flex flex-col items-center justify-center group focus:outline-none"
              onClick={() => onAppClick(app.id)}
            >
              <div className="w-20 h-20 flex items-center justify-center mb-2 rounded-2xl transition-transform group-hover:scale-105 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-white/60">
                <img src={app.icon} alt="" className="w-16 h-16 object-contain drop-shadow-lg" draggable="false" />
              </div>
              <span className="text-white text-sm text-center drop-shadow">{app.title}</span>
            </button>
          ))}
        </div>

        {filteredApps.length === 0 && <p className="text-center text-white/70">No apps match “{searchTerm}”.</p>}
      </div>
    </div>
  )
}
