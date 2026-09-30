"use client"

import { useEffect, useState } from "react"
import { AppleIcon } from "@/components/icons"

interface SleepScreenProps {
  onWakeUp: () => void
}

export default function SleepScreen({ onWakeUp }: SleepScreenProps) {
  const [showWakeText, setShowWakeText] = useState(false)

  useEffect(() => {
    // Show the "Click to wake up" text after a delay
    const timer = setTimeout(() => setShowWakeText(true), 2000)

    // Any key wakes the computer up too
    const handleKeyDown = () => onWakeUp()
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onWakeUp])

  return (
    <div
      className="h-full w-full bg-black flex flex-col items-center justify-center cursor-pointer"
      onClick={onWakeUp}
    >
      <AppleIcon className="w-20 h-20 text-white mb-8 opacity-30" />

      {showWakeText && <p className="text-white text-lg opacity-50 animate-pulse">Click or press any key to wake up</p>}
    </div>
  )
}
