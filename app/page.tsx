"use client"

import { useState, useEffect, useCallback } from "react"
import BootScreen from "@/components/boot-screen"
import LoginScreen from "@/components/login-screen"
import Desktop from "@/components/desktop"
import SleepScreen from "@/components/sleep-screen"
import ShutdownScreen from "@/components/shutdown-screen"
import { readSetting, writeSetting } from "@/components/system-context"

type SystemState = "booting" | "login" | "desktop" | "sleeping" | "shutdown"

export default function Home() {
  const [systemState, setSystemState] = useState<SystemState>("booting")
  const [bootId, setBootId] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false) // Default to light mode
  const [screenBrightness, setScreenBrightness] = useState(100)

  // Load settings from localStorage
  useEffect(() => {
    const savedDarkMode = readSetting("isDarkMode")
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === "true")
    }

    const savedBrightness = Number.parseInt(readSetting("screenBrightness") ?? "", 10)
    if (!Number.isNaN(savedBrightness)) {
      setScreenBrightness(Math.min(100, Math.max(10, savedBrightness)))
    }
  }, [])

  const handleBootComplete = useCallback(() => setSystemState("login"), [])

  const boot = () => {
    // A new key remounts the boot screen so the progress bar restarts
    setBootId((id) => id + 1)
    setSystemState("booting")
  }

  const setDarkMode = useCallback((value: boolean) => {
    setIsDarkMode(value)
    writeSetting("isDarkMode", value.toString())
  }, [])

  const toggleDarkMode = () => setDarkMode(!isDarkMode)

  const updateBrightness = useCallback((value: number) => {
    setScreenBrightness(value)
    writeSetting("screenBrightness", value.toString())
  }, [])

  // Render the appropriate screen based on system state
  const renderScreen = () => {
    switch (systemState) {
      case "booting":
        return <BootScreen key={bootId} onComplete={handleBootComplete} isDarkMode={isDarkMode} />

      case "login":
        return (
          <LoginScreen
            onLogin={() => setSystemState("desktop")}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )

      case "desktop":
        return (
          <Desktop
            onLogout={() => setSystemState("login")}
            onSleep={() => setSystemState("sleeping")}
            onShutdown={() => setSystemState("shutdown")}
            onRestart={boot}
            isDarkMode={isDarkMode}
            onDarkModeChange={setDarkMode}
            brightness={screenBrightness}
            onBrightnessChange={updateBrightness}
          />
        )

      case "sleeping":
        return <SleepScreen onWakeUp={() => setSystemState("login")} />

      case "shutdown":
        return <ShutdownScreen onBoot={boot} />
    }
  }

  return (
    <main className="relative h-dvh w-screen overflow-hidden">
      {renderScreen()}

      {/* Brightness overlay - applies to every screen */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black pointer-events-none z-[100] transition-opacity duration-300"
        style={{ opacity: ((100 - screenBrightness) / 100) * 0.85 }}
      />
    </main>
  )
}
