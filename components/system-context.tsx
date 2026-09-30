"use client"

import { createContext, useContext } from "react"

// Shared system state for the desktop, menubar, control center and apps.
// Replaces ad-hoc localStorage polling so every part of the UI stays in sync.
export interface SystemState {
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
  brightness: number
  setBrightness: (value: number) => void
  wifiEnabled: boolean
  setWifiEnabled: (value: boolean) => void
  volume: number
  setVolume: (value: number) => void
  openApp: (id: string) => void
}

const SystemContext = createContext<SystemState | null>(null)

export const SystemProvider = SystemContext.Provider

export function useSystem(): SystemState {
  const context = useContext(SystemContext)
  if (!context) {
    throw new Error("useSystem must be used inside <SystemProvider>")
  }
  return context
}

// Safe localStorage helpers: storage can be unavailable (private mode, blocked cookies).
export function readSetting(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeSetting(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore — settings just won't persist
  }
}
