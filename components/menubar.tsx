"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { AppleIcon } from "@/components/icons"
import { useSystem } from "@/components/system-context"
import { profile } from "@/lib/profile"
import type { AppWindow } from "@/types"

interface BatteryManagerLike extends EventTarget {
  level: number
  charging: boolean
}

interface MenubarProps {
  onLogout: () => void
  onSleep: () => void
  onShutdown: () => void
  onRestart: () => void
  onSpotlightClick: () => void
  onControlCenterClick: () => void
  onOpenApp: (id: string) => void
  onCloseWindow: (id: string) => void
  onMinimizeWindow: (id: string) => void
  activeWindow: AppWindow | null
}

type MenuItem = { label: string; onClick?: () => void; disabled?: boolean } | "separator"

export default function Menubar({
  onLogout,
  onSleep,
  onShutdown,
  onRestart,
  onSpotlightClick,
  onControlCenterClick,
  onOpenApp,
  onCloseWindow,
  onMinimizeWindow,
  activeWindow,
}: MenubarProps) {
  const { isDarkMode, wifiEnabled, setWifiEnabled } = useSystem()
  const [time, setTime] = useState<Date | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [batteryLevel, setBatteryLevel] = useState(100)
  const [isCharging, setIsCharging] = useState(false)
  const [showWifiToggle, setShowWifiToggle] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // The clock lives here (instead of the desktop) so ticking doesn't re-render every open window
  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Show the real battery status where the browser exposes it
  useEffect(() => {
    let battery: BatteryManagerLike | null = null
    const update = () => {
      if (!battery) return
      setBatteryLevel(Math.round(battery.level * 100))
      setIsCharging(battery.charging)
    }

    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManagerLike> }
    nav
      .getBattery?.()
      .then((result) => {
        battery = result
        update()
        battery.addEventListener("levelchange", update)
        battery.addEventListener("chargingchange", update)
      })
      .catch(() => {})

    return () => {
      battery?.removeEventListener("levelchange", update)
      battery?.removeEventListener("chargingchange", update)
    }
  }, [])

  // Close menus when clicking elsewhere or pressing Escape
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
        setShowWifiToggle(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(null)
        setShowWifiToggle(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const toggleMenu = (menuName: string) => {
    setShowWifiToggle(false)
    setActiveMenu((current) => (current === menuName ? null : menuName))
  }

  const runAndClose = (action?: () => void) => () => {
    setActiveMenu(null)
    action?.()
  }

  const appleMenu: MenuItem[] = [
    { label: "About This Mac", onClick: () => onOpenApp("about") },
    "separator",
    { label: "System Settings...", onClick: () => onOpenApp("settings") },
    "separator",
    { label: "Sleep", onClick: onSleep },
    { label: "Restart...", onClick: onRestart },
    { label: "Shut Down...", onClick: onShutdown },
    "separator",
    { label: "Lock Screen", onClick: onLogout },
    { label: `Log Out ${profile.firstName}...`, onClick: onLogout },
  ]

  const appName = activeWindow?.title ?? "Finder"
  const appMenu: MenuItem[] = activeWindow
    ? [
        { label: "Minimize", onClick: () => onMinimizeWindow(activeWindow.id) },
        { label: "Close Window", onClick: () => onCloseWindow(activeWindow.id) },
        "separator",
        { label: `Quit ${activeWindow.title}`, onClick: () => onCloseWindow(activeWindow.id) },
      ]
    : [
        { label: "About Me", onClick: () => onOpenApp("notes") },
        { label: "Projects", onClick: () => onOpenApp("safari") },
        { label: "Contact", onClick: () => onOpenApp("mail") },
        "separator",
        { label: "Search...", onClick: onSpotlightClick },
      ]

  const menuBgClass = isDarkMode ? "bg-black/40" : "bg-white/30"
  const dropdownBgClass = isDarkMode
    ? "bg-gray-800/90 border-white/10 text-white"
    : "bg-gray-100/90 border-black/10 text-gray-900"
  const textClass = isDarkMode ? "text-white" : "text-gray-900"
  const separatorClass = isDarkMode ? "border-white/15" : "border-black/10"

  const renderDropdown = (items: MenuItem[], className: string) => (
    <div
      role="menu"
      className={`absolute top-6 ${className} ${dropdownBgClass} backdrop-blur-xl border rounded-lg shadow-xl p-1 w-56 animate-in fade-in duration-100`}
    >
      {items.map((item, index) =>
        item === "separator" ? (
          <div key={`sep-${index}`} className={`border-t ${separatorClass} my-1 mx-2`} />
        ) : (
          <button
            key={item.label}
            role="menuitem"
            disabled={item.disabled}
            className="w-full text-left px-3 py-0.5 rounded hover:bg-blue-500 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
            onClick={runAndClose(item.onClick)}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  )

  const topButtonClass = (name: string) =>
    `px-2 py-0.5 rounded ${activeMenu === name ? (isDarkMode ? "bg-white/20" : "bg-black/10") : ""}`

  const formattedDate =
    time?.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "") ?? ""
  const formattedTime = time?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) ?? ""

  return (
    <header
      ref={menuRef}
      className={`fixed top-0 left-0 right-0 h-6 ${menuBgClass} backdrop-blur-xl z-50 flex items-center px-2 sm:px-3 ${textClass} text-[13px] select-none`}
    >
      <nav className="flex-1 flex items-center min-w-0">
        <div className="relative">
          <button
            className={topButtonClass("apple")}
            onClick={() => toggleMenu("apple")}
            onMouseEnter={() => activeMenu && activeMenu !== "apple" && setActiveMenu("apple")}
            aria-label="Apple menu"
            aria-haspopup="menu"
            aria-expanded={activeMenu === "apple"}
          >
            <AppleIcon className="w-3.5 h-3.5" />
          </button>
          {activeMenu === "apple" && renderDropdown(appleMenu, "left-0")}
        </div>

        <div className="relative min-w-0">
          <button
            className={`${topButtonClass("app")} font-semibold truncate max-w-[40vw]`}
            onClick={() => toggleMenu("app")}
            onMouseEnter={() => activeMenu && activeMenu !== "app" && setActiveMenu("app")}
            aria-haspopup="menu"
            aria-expanded={activeMenu === "app"}
          >
            {appName}
          </button>
          {activeMenu === "app" && renderDropdown(appMenu, "left-0")}
        </div>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5" title={`Battery ${batteryLevel}%${isCharging ? " (charging)" : ""}`}>
          <span className="text-xs">{batteryLevel}%</span>
          <div className="w-6 h-3 border border-current rounded-sm relative p-px">
            <div className="h-full bg-current rounded-[1px]" style={{ width: `${batteryLevel}%` }} />
            <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-1.5 bg-current rounded-r-sm" />
            {isCharging && (
              <div className="absolute inset-0 flex items-center justify-center text-[8px] leading-none">⚡</div>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setActiveMenu(null)
              setShowWifiToggle((value) => !value)
            }}
            aria-label={`Wi-Fi ${wifiEnabled ? "on" : "off"}`}
            aria-expanded={showWifiToggle}
            className="flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              {wifiEnabled ? (
                <>
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="1" />
                </>
              ) : (
                <>
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="1" />
                </>
              )}
            </svg>
          </button>

          {showWifiToggle && (
            <div
              className={`absolute top-6 -right-16 sm:right-0 ${dropdownBgClass} backdrop-blur-xl border rounded-lg shadow-xl py-3 px-4 w-64 animate-in fade-in duration-100`}
            >
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium">Wi-Fi</span>
                <span className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={wifiEnabled}
                    onChange={() => setWifiEnabled(!wifiEnabled)}
                    className="sr-only peer"
                  />
                  <span className="w-11 h-6 bg-gray-500 rounded-full peer-checked:bg-blue-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5" />
                </span>
              </label>
              <p className="text-xs opacity-60 mt-2">
                {wifiEnabled ? "Connected to Portfolio-5G" : "Wi-Fi is off. Safari will show as offline."}
              </p>
            </div>
          )}
        </div>

        <button onClick={onSpotlightClick} aria-label="Spotlight search" title="Spotlight (Ctrl+K)">
          <Search className="w-3.5 h-3.5" />
        </button>

        <button onClick={onControlCenterClick} className="flex items-center justify-center" aria-label="Control Center">
          <img
            src="/control-center-icon.webp"
            alt=""
            className="w-4 h-4"
            style={{ filter: isDarkMode ? "invert(1)" : "none", opacity: 0.9 }}
          />
        </button>

        <span className="tabular-nums whitespace-nowrap">
          <span className="hidden sm:inline">{formattedDate} </span>
          {formattedTime}
        </span>
      </div>
    </header>
  )
}
