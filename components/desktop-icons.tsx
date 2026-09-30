"use client"

import { useRef, useState } from "react"

// Shortcuts on the desktop so first-time visitors can find the important stuff quickly
const shortcuts = [
  { appId: "notes", label: "About Me", icon: "/notes.png" },
  { appId: "safari", label: "Projects", icon: "/safari.png" },
  { appId: "mail", label: "Contact Me", icon: "/mail.png" },
  { appId: "terminal", label: "Terminal", icon: "/terminal.png" },
]

interface DesktopIconsProps {
  onOpen: (appId: string) => void
}

export default function DesktopIcons({ onOpen }: DesktopIconsProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const lastPointerType = useRef<string>("mouse")

  return (
    <nav
      aria-label="Desktop shortcuts"
      className="absolute top-10 right-3 sm:right-5 z-[5] flex flex-col items-center gap-3 sm:gap-4"
    >
      {shortcuts.map((shortcut) => (
        <button
          key={shortcut.appId}
          className="group flex flex-col items-center w-20 p-1 rounded-md focus:outline-none"
          title={`Open ${shortcut.label}`}
          // Single click selects and double click opens (like macOS); touch screens open on tap
          onPointerDown={(e) => {
            lastPointerType.current = e.pointerType
          }}
          onClick={(e) => {
            // detail === 0 means the button was activated from the keyboard
            if (lastPointerType.current !== "mouse" || e.detail === 0) onOpen(shortcut.appId)
            else setSelected(shortcut.appId)
          }}
          onDoubleClick={() => onOpen(shortcut.appId)}
          onBlur={() => setSelected((current) => (current === shortcut.appId ? null : current))}
        >
          <span
            className={`w-14 h-14 flex items-center justify-center rounded-lg ${
              selected === shortcut.appId ? "bg-black/25 ring-1 ring-white/40" : ""
            }`}
          >
            <img src={shortcut.icon} alt="" className="w-12 h-12 object-contain drop-shadow-md" draggable="false" />
          </span>
          <span
            className={`mt-1 px-1.5 rounded text-xs font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] ${
              selected === shortcut.appId ? "bg-blue-600 [text-shadow:none]" : ""
            }`}
          >
            {shortcut.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
