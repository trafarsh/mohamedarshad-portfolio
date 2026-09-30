"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { profile } from "@/lib/profile"

interface VSCodeProps {
  isDarkMode?: boolean
}

// Shows the portfolio's source code in a browser-based VS Code (github1s)
export default function VSCode(_props: VSCodeProps) {
  const [isLoading, setIsLoading] = useState(true)
  const repoUrl = `https://github.com/${profile.sourceRepo}`

  return (
    <div className="h-full w-full bg-[#1e1e1e] flex flex-col">
      <div className="h-8 shrink-0 flex items-center justify-between px-3 bg-[#252526] text-gray-300 text-xs border-b border-black/40">
        <span className="truncate">{profile.sourceRepo}</span>
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-white shrink-0"
        >
          Open on GitHub <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-sm gap-3">
            <img src="/vscode.png" alt="" className="w-14 h-14 animate-pulse" />
            Loading editor…
          </div>
        )}
        <iframe
          src={`https://github1s.com/${profile.sourceRepo}/blob/main/README.md`}
          className="w-full h-full border-0"
          title="VS Code project view"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  )
}
