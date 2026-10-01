"use client"

import { useState, useEffect, useRef } from "react"
import { Wifi, WifiOff, Bluetooth, Moon, Sun, Volume1, Volume2, VolumeX, Maximize, Minimize, SunDim } from "lucide-react"
import { useSystem } from "@/components/system-context"

interface ControlCenterProps {
  onClose: () => void
}

export default function ControlCenter({ onClose }: ControlCenterProps) {
  const { isDarkMode, toggleDarkMode, brightness, setBrightness, wifiEnabled, setWifiEnabled, volume, setVolume } =
    useSystem()
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsFullscreen(!!document.fullscreenElement)
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Close when clicking anywhere outside the panel (except the menubar toggle, which handles itself)
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement
      if (panelRef.current?.contains(target) || target.closest("[aria-label='Control Center']")) return
      onClose()
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [onClose])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err: Error) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen?.()
    }
  }

  const tileClass = (enabled: boolean) =>
    `flex flex-col items-center justify-center p-3 rounded-xl transition-colors ${
      enabled ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
    }`

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Control Center panel"
      className="fixed top-8 right-2 sm:right-4 w-[calc(100%-1rem)] max-w-80 bg-gray-800/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-40 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <button className={tileClass(wifiEnabled)} onClick={() => setWifiEnabled(!wifiEnabled)} aria-pressed={wifiEnabled}>
            {wifiEnabled ? <Wifi className="w-6 h-6 text-white mb-1" /> : <WifiOff className="w-6 h-6 text-white mb-1" />}
            <span className="text-white text-xs">Wi-Fi</span>
          </button>

          <button
            className={tileClass(bluetoothEnabled)}
            onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
            aria-pressed={bluetoothEnabled}
          >
            <Bluetooth className="w-6 h-6 text-white mb-1" />
            <span className="text-white text-xs">Bluetooth</span>
          </button>

          <button className={tileClass(isDarkMode)} onClick={toggleDarkMode} aria-pressed={isDarkMode}>
            {isDarkMode ? <Moon className="w-6 h-6 text-white mb-1" /> : <Sun className="w-6 h-6 text-white mb-1" />}
            <span className="text-white text-xs">{isDarkMode ? "Dark" : "Light"}</span>
          </button>

          <button className={tileClass(isFullscreen)} onClick={toggleFullscreen} aria-pressed={isFullscreen}>
            {isFullscreen ? <Minimize className="w-6 h-6 text-white mb-1" /> : <Maximize className="w-6 h-6 text-white mb-1" />}
            <span className="text-white text-xs">{isFullscreen ? "Exit" : "Full"}</span>
          </button>
        </div>

        <div className="bg-gray-700/80 rounded-xl p-3 mb-3">
          <label htmlFor="cc-brightness" className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Display</span>
            <span className="text-white/70 text-sm tabular-nums">{brightness}%</span>
          </label>
          <div className="flex items-center">
            <SunDim className="w-5 h-5 text-white mr-2" />
            <input
              id="cc-brightness"
              type="range"
              min="10"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number.parseInt(e.target.value, 10))}
              className="flex-1 h-1 accent-white cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-gray-700/80 rounded-xl p-3">
          <label htmlFor="cc-volume" className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Sound</span>
            <span className="text-white/70 text-sm tabular-nums">{volume}%</span>
          </label>
          <div className="flex items-center">
            <button onClick={() => setVolume(volume === 0 ? 75 : 0)} aria-label={volume === 0 ? "Unmute" : "Mute"}>
              <VolumeIcon className="w-5 h-5 text-white mr-2" />
            </button>
            <input
              id="cc-volume"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number.parseInt(e.target.value, 10))}
              className="flex-1 h-1 accent-white cursor-pointer"
            />
          </div>
          <p className="text-white/50 text-[11px] mt-2">System volume controls the Spotify player.</p>
        </div>
      </div>
    </div>
  )
}
