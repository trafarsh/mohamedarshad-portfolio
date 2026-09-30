"use client"

import { ExternalLink } from "lucide-react"

interface YouTubeProps {
  isDarkMode?: boolean
}

export default function YouTube({ isDarkMode = true }: YouTubeProps) {
  const textColor = isDarkMode ? "text-white" : "text-gray-800"
  const bgColor = isDarkMode ? "bg-gray-900" : "bg-white"

  return (
    <div className={`h-full ${bgColor} ${textColor} p-6 flex items-center justify-center`}>
      <div className="text-center max-w-sm">
        <img src="/youtube.png" alt="" className="w-20 h-20 mx-auto mb-4 object-contain" />
        <h2 className="text-xl font-semibold mb-2">YouTube</h2>
        <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          YouTube can&apos;t be displayed inside this window. Open it in a new browser tab instead.
        </p>
        <a
          href="https://www.youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium"
        >
          Open YouTube <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}
