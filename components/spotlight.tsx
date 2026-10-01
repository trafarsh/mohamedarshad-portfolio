"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Search, ExternalLink, Globe } from "lucide-react"
import { listedApps } from "@/lib/apps"
import { projects } from "@/data/projects"

interface SpotlightProps {
  onClose: () => void
  onAppClick: (id: string) => void
}

interface Result {
  key: string
  title: string
  subtitle: string
  icon?: string
  section: string
  run: () => void
}

export default function Spotlight({ onClose, onAppClick }: SpotlightProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo<Result[]>(() => {
    const query = searchTerm.trim().toLowerCase()
    const matches = (...fields: (string | undefined)[]) => fields.some((field) => field?.toLowerCase().includes(query))

    const appResults: Result[] = listedApps
      .filter((app) => !query || matches(app.title, ...(app.keywords ?? [])))
      .map((app) => ({
        key: `app-${app.id}`,
        title: app.title,
        subtitle: "Application",
        icon: app.icon,
        section: query ? "Applications" : "Suggestions",
        run: () => onAppClick(app.id),
      }))

    if (!query) return appResults

    const projectResults: Result[] = projects
      .filter((project) => matches(project.title, project.description, project.category, ...project.technologies))
      .map((project) => ({
        key: `project-${project.id}`,
        title: project.title,
        subtitle: project.technologies.join(" • "),
        icon: project.image,
        section: "Projects",
        run: () => window.open(project.liveUrl, "_blank", "noopener,noreferrer"),
      }))

    const webResult: Result = {
      key: "web",
      title: `Search the web for “${searchTerm.trim()}”`,
      subtitle: "Opens in a new tab",
      section: "Web",
      run: () =>
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm.trim())}`, "_blank", "noopener,noreferrer"),
    }

    return [...appResults, ...projectResults, webResult]
  }, [searchTerm, onAppClick])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Reset selection when the search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchTerm])

  // Keep the highlighted result visible
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  const runResult = (result: Result) => {
    result.run()
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault()
      runResult(results[selectedIndex])
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Spotlight search"
        className="w-full max-w-2xl bg-gray-800/85 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Spotlight Search — apps, projects, skills..."
            aria-label="Search"
            className="w-full bg-transparent text-white border-0 py-4 pl-12 pr-4 focus:outline-none text-lg placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {results.length > 0 && (
          <div ref={listRef} className="max-h-80 overflow-y-auto border-t border-white/10 py-1" role="listbox">
            {results.map((result, index) => (
              <div key={result.key}>
                {(index === 0 || results[index - 1].section !== result.section) && (
                  <div className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {result.section}
                  </div>
                )}
                <div
                  data-index={index}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={`flex items-center mx-1.5 px-3 py-2 rounded-lg cursor-pointer ${
                    index === selectedIndex ? "bg-blue-500" : ""
                  }`}
                  onClick={() => runResult(result)}
                  onMouseMove={() => setSelectedIndex(index)}
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3 shrink-0">
                    {result.icon ? (
                      <img src={result.icon} alt="" className="w-7 h-7 object-contain rounded" />
                    ) : (
                      <Globe className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white truncate">{result.title}</div>
                    <div className={`text-xs truncate ${index === selectedIndex ? "text-blue-100" : "text-gray-400"}`}>
                      {result.subtitle}
                    </div>
                  </div>
                  {result.section === "Projects" && <ExternalLink className="w-4 h-4 text-gray-300 shrink-0 ml-2" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
