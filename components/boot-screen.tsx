"use client"

import { useEffect, useState } from "react"
import { AppleIcon } from "@/components/icons"

interface BootScreenProps {
  onComplete: () => void
  isDarkMode: boolean
}

const BOOT_DURATION_MS = 2400

export default function BootScreen({ onComplete, isDarkMode }: BootScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let frame = 0
    let doneTimer: ReturnType<typeof setTimeout> | undefined

    const tick = (now: number) => {
      // Ease-out so the bar slows down near the end, like the real thing
      const t = Math.min(1, (now - start) / BOOT_DURATION_MS)
      setProgress(Math.round((1 - Math.pow(1 - t, 2)) * 100))

      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        doneTimer = setTimeout(onComplete, 300)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      if (doneTimer) clearTimeout(doneTimer)
    }
  }, [onComplete])

  const bgColor = isDarkMode ? "bg-black" : "bg-white"
  const textColor = isDarkMode ? "text-white" : "text-black"
  const trackColor = isDarkMode ? "bg-gray-700" : "bg-gray-300"

  return (
    <div className={`h-full w-full ${bgColor} flex flex-col items-center justify-center relative overflow-hidden`}>
      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        <AppleIcon className={`w-20 h-24 mb-12 ${textColor}`} />

        <div
          className={`w-56 h-1.5 ${trackColor} rounded-full overflow-hidden`}
          role="progressbar"
          aria-label="Starting up"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className={`mt-6 text-sm ${textColor} opacity-50 animate-pulse`}>Starting up...</p>
      </div>
    </div>
  )
}
