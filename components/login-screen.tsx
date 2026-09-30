"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowRight, Moon, Sun } from "lucide-react"
import { profile } from "@/lib/profile"

interface LoginScreenProps {
  onLogin: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export default function LoginScreen({ onLogin, isDarkMode, onToggleDarkMode }: LoginScreenProps) {
  const [password, setPassword] = useState("")
  const [time, setTime] = useState<Date | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Update time every second
  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // This is a portfolio, so any password (or none) unlocks the desktop
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoggingIn) return
    setIsLoggingIn(true)
    setTimeout(onLogin, 400)
  }

  const formattedTime = time?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) ?? ""
  const formattedDate =
    time?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) ?? ""

  // Choose wallpaper based on dark/light mode
  const wallpaper = isDarkMode ? "/wallpaper-night.jpg" : "/wallpaper-day.jpg"

  return (
    <div
      className="h-full w-full bg-cover bg-center flex flex-col items-center justify-between py-16 px-4"
      style={{ backgroundImage: `url('${wallpaper}')` }}
    >
      <div className="flex flex-col items-center text-white drop-shadow-lg" suppressHydrationWarning>
        <div className="text-lg sm:text-xl font-medium opacity-90 min-h-7">{formattedDate}</div>
        <div className="text-7xl sm:text-8xl font-semibold tracking-tight min-h-20">{formattedTime}</div>
      </div>

      <div
        className={`flex flex-col items-center transition-all duration-300 ${
          isLoggingIn ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 flex items-center justify-center mb-4 shadow-xl ring-2 ring-white/30">
          <span className="text-white text-5xl font-bold">{profile.firstName.charAt(0)}</span>
        </div>
        <h2 className="text-white text-2xl font-medium mb-5 drop-shadow">{profile.firstName}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="relative">
            <input
              type="password"
              placeholder="Enter Password"
              aria-label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-56 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white placeholder:text-white/70 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              aria-label="Log in"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white/80 text-xs mt-3 drop-shadow">Press Enter or click the arrow — any password works</p>
        </form>
      </div>

      <button
        className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
        onClick={onToggleDarkMode}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={isDarkMode ? "Light mode" : "Dark mode"}
      >
        {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>
    </div>
  )
}
