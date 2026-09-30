"use client"

import { useState } from "react"
import { User, Wifi, Volume2, Monitor, Palette, Keyboard, Info } from "lucide-react"
import { useSystem } from "@/components/system-context"
import { profile } from "@/lib/profile"

interface SettingsProps {
  isDarkMode?: boolean
}

const sections = [
  { id: "appearance", name: "Appearance", icon: Palette },
  { id: "display", name: "Displays", icon: Monitor },
  { id: "sound", name: "Sound", icon: Volume2 },
  { id: "wifi", name: "Wi-Fi", icon: Wifi },
  { id: "keyboard", name: "Keyboard Shortcuts", icon: Keyboard },
  { id: "users", name: "Users & Groups", icon: User },
  { id: "about", name: "About", icon: Info },
] as const

type SectionId = (typeof sections)[number]["id"]

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-blue-500" : "bg-gray-400"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  )
}

export default function Settings({ isDarkMode = true }: SettingsProps) {
  const system = useSystem()
  const [activeSection, setActiveSection] = useState<SectionId>("appearance")

  const sidebarBg = isDarkMode ? "bg-gray-800/70" : "bg-gray-100"
  const cardBg = isDarkMode ? "bg-gray-800" : "bg-gray-50 border border-gray-200"
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-500"
  const rowClass = "flex items-center justify-between gap-4 py-3"
  const divider = isDarkMode ? "divide-gray-700" : "divide-gray-200"

  const renderSection = () => {
    switch (activeSection) {
      case "appearance":
        return (
          <>
            <h3 className="text-lg font-medium mb-3">Appearance</h3>
            <div className="flex gap-4 mb-6">
              {[
                { label: "Light", dark: false, preview: "bg-white", bar: "bg-gray-200" },
                { label: "Dark", dark: true, preview: "bg-gray-800", bar: "bg-gray-700" },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => system.setDarkMode(option.dark)}
                  className="flex flex-col items-center"
                  aria-pressed={system.isDarkMode === option.dark}
                >
                  <span
                    className={`block p-1 rounded-lg border-2 ${
                      system.isDarkMode === option.dark ? "border-blue-500" : "border-transparent"
                    }`}
                  >
                    <span className={`${option.preview} w-28 h-20 rounded flex flex-col overflow-hidden shadow`}>
                      <span className={`h-4 ${option.bar}`} />
                    </span>
                  </span>
                  <span className="text-sm mt-1">{option.label}</span>
                </button>
              ))}
            </div>
            <p className={`text-sm ${mutedText}`}>
              Changes the wallpaper, windows and apps. Your choice is remembered next time you visit.
            </p>
          </>
        )

      case "display":
        return (
          <>
            <h3 className="text-lg font-medium mb-3">Displays</h3>
            <div className={`${cardBg} rounded-lg px-4`}>
              <div className={rowClass}>
                <label htmlFor="settings-brightness">Brightness</label>
                <input
                  id="settings-brightness"
                  type="range"
                  min={10}
                  max={100}
                  value={system.brightness}
                  onChange={(e) => system.setBrightness(Number(e.target.value))}
                  className="w-48 accent-blue-500"
                />
              </div>
            </div>
          </>
        )

      case "sound":
        return (
          <>
            <h3 className="text-lg font-medium mb-3">Sound</h3>
            <div className={`${cardBg} rounded-lg px-4`}>
              <div className={rowClass}>
                <label htmlFor="settings-volume">Output volume</label>
                <input
                  id="settings-volume"
                  type="range"
                  min={0}
                  max={100}
                  value={system.volume}
                  onChange={(e) => system.setVolume(Number(e.target.value))}
                  className="w-48 accent-blue-500"
                />
              </div>
            </div>
          </>
        )

      case "wifi":
        return (
          <>
            <h3 className="text-lg font-medium mb-3">Wi-Fi</h3>
            <div className={`${cardBg} rounded-lg px-4 divide-y ${divider}`}>
              <div className={rowClass}>
                <span>Wi-Fi</span>
                <Toggle checked={system.wifiEnabled} onChange={system.setWifiEnabled} label="Wi-Fi" />
              </div>
              <div className={rowClass}>
                <span>Network</span>
                <span className={mutedText}>{system.wifiEnabled ? "Portfolio-5G" : "Not connected"}</span>
              </div>
            </div>
          </>
        )

      case "keyboard":
        return (
          <>
            <h3 className="text-lg font-medium mb-3">Keyboard Shortcuts</h3>
            <div className={`${cardBg} rounded-lg px-4 divide-y ${divider}`}>
              {[
                ["Spotlight search", "⌘K / Ctrl+K / Ctrl+Space"],
                ["Close menus & overlays", "Esc"],
                ["Maximize / restore window", "Double-click title bar"],
                ["Snake: move / pause", "Arrow keys / Space"],
                ["Terminal: history / complete", "↑ ↓ / Tab"],
              ].map(([action, keys]) => (
                <div key={action} className={rowClass}>
                  <span>{action}</span>
                  <kbd className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>{keys}</kbd>
                </div>
              ))}
            </div>
          </>
        )

      case "users":
        return (
          <>
            <h3 className="text-lg font-medium mb-3">Users & Groups</h3>
            <div className={`${cardBg} rounded-lg p-4 flex items-center gap-4`}>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 flex items-center justify-center text-white text-2xl font-bold">
                {profile.firstName.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{profile.name}</p>
                <p className={`text-sm ${mutedText}`}>Admin · {profile.role}</p>
              </div>
            </div>
          </>
        )

      case "about":
        return (
          <>
            <h3 className="text-lg font-medium mb-3">About</h3>
            <div className={`${cardBg} rounded-lg px-4 divide-y ${divider}`}>
              {[
                ["Name", `${profile.firstName}'s MacBook Portfolio`],
                ["Owner", profile.name],
                ["Location", profile.location],
                ["Framework", "Next.js + React + Tailwind CSS"],
              ].map(([label, value]) => (
                <div key={label} className={rowClass}>
                  <span>{label}</span>
                  <span className={`${mutedText} text-right`}>{value}</span>
                </div>
              ))}
            </div>
          </>
        )
    }
  }

  return (
    <div className="flex h-full">
      <nav className={`w-44 sm:w-56 shrink-0 ${sidebarBg} p-2 overflow-y-auto`} aria-label="Settings sections">
        {sections.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            className={`w-full flex items-center px-3 py-1.5 rounded-md text-sm text-left ${
              activeSection === id ? "bg-blue-500 text-white" : isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
            onClick={() => setActiveSection(id)}
          >
            <Icon className="w-4 h-4 mr-2.5 shrink-0" />
            <span className="truncate">{name}</span>
          </button>
        ))}
      </nav>

      <div className="flex-1 p-6 overflow-y-auto">{renderSection()}</div>
    </div>
  )
}
