"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ArrowLeft, ArrowRight, RefreshCw, Home, Search, WifiOff, ExternalLink, Github, Lock } from "lucide-react"
import { useSystem } from "@/components/system-context"
import { profile } from "@/lib/profile"
import { projects, type Project } from "@/data/projects"

interface SafariProps {
  isDarkMode?: boolean
}

const socialLinks = [
  { title: "LinkedIn", url: profile.linkedin.url, icon: "/linkedin.png" },
  { title: "GitHub", url: profile.github.url, icon: "/github.png" },
  { title: "Email", url: `mailto:${profile.email}`, icon: "/mail.png" },
]

const frequentlyVisited = [
  { title: "GitHub", url: "https://github.com", icon: "/github.png" },
  { title: "LinkedIn", url: "https://linkedin.com", icon: "/linkedin.png" },
  { title: "YouTube", url: "https://youtube.com", icon: "/youtube.png" },
  { title: "Reddit", url: "https://reddit.com", icon: "/reddit.png" },
  { title: "ChatGPT", url: "https://chatgpt.com", icon: "/chatgpt.png" },
  { title: "Stack Overflow", url: "https://stackoverflow.com", icon: "/stackoverflow.png" },
]

const COVER_GRADIENTS = [
  "from-green-500 to-emerald-700",
  "from-sky-500 to-indigo-700",
  "from-amber-500 to-orange-700",
  "from-pink-500 to-purple-700",
]

const openExternal = (url: string) => window.open(url, "_blank", "noopener,noreferrer")

// Turns whatever was typed in the address bar into a URL (or a web search)
function toUrl(input: string) {
  const value = input.trim()
  if (/^https?:\/\//i.test(value)) return value
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(value)) return `https://${value}`
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`
}

export default function Safari({ isDarkMode = true }: SafariProps) {
  const { wifiEnabled } = useSystem()
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const projectsRef = useRef<HTMLElement>(null)

  const textColor = isDarkMode ? "text-white" : "text-gray-800"
  const bgColor = isDarkMode ? "bg-gray-900" : "bg-white"
  const toolbarBg = isDarkMode ? "bg-gray-800" : "bg-gray-100"
  const inputBg = isDarkMode ? "bg-gray-700" : "bg-gray-200"
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200"
  const cardBg = isDarkMode ? "bg-gray-800" : "bg-gray-50"
  const hoverBg = isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
  const iconButton = `p-1.5 rounded-md ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"} disabled:opacity-40`
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-500"

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 800)
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim()) return
    openExternal(toUrl(address))
    setAddress("")
  }

  const scrollToTop = () => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  const scrollToProjects = () => projectsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  const renderProjectCard = (project: Project, index: number) => (
    <article
      key={project.id}
      className={`${cardBg} rounded-xl overflow-hidden border ${borderColor} hover:border-blue-500 transition-colors group flex flex-col`}
    >
      <button
        className="h-36 w-full overflow-hidden relative"
        onClick={() => openExternal(project.liveUrl)}
        aria-label={`Open ${project.title} live demo`}
      >
        {project.image ? (
          <img
            src={project.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${COVER_GRADIENTS[index % COVER_GRADIENTS.length]} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
          >
            <span className="text-white text-4xl font-bold drop-shadow">
              {project.title
                .split(" ")
                .slice(0, 2)
                .map((word) => word[0])
                .join("")}
            </span>
          </div>
        )}
        <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wide bg-black/60 text-white px-2 py-0.5 rounded-full">
          {project.category}
        </span>
      </button>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-500 transition-colors">{project.title}</h3>
        <p className={`text-sm ${mutedText} mb-3 flex-1`}>{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className={`text-[11px] px-2 py-0.5 rounded-full ${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"}`}
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openExternal(project.liveUrl)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> View Live
          </button>
          <button
            onClick={() => openExternal(project.githubUrl)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 ${
              isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
            } rounded-lg text-sm font-medium transition-colors`}
          >
            <Github className="w-4 h-4" /> Code
          </button>
        </div>
      </div>
    </article>
  )

  const renderTile = (site: { title: string; url: string; icon: string }) => (
    <button
      key={site.title + site.url}
      className={`flex flex-col items-center p-3 rounded-lg ${hoverBg}`}
      onClick={() => (site.url.startsWith("mailto:") ? (window.location.href = site.url) : openExternal(site.url))}
    >
      <span className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-2 overflow-hidden shadow-sm">
        <img src={site.icon} alt="" className="w-8 h-8 object-contain" />
      </span>
      <span className="text-xs text-center">{site.title}</span>
    </button>
  )

  return (
    <div className={`h-full flex flex-col ${bgColor} ${textColor}`}>
      {/* Toolbar */}
      <div className={`${toolbarBg} border-b ${borderColor} p-2 flex items-center gap-1`}>
        <button className={iconButton} disabled aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button className={iconButton} disabled aria-label="Forward">
          <ArrowRight className="w-4 h-4" />
        </button>
        <button className={iconButton} onClick={scrollToTop} aria-label="Home">
          <Home className="w-4 h-4" />
        </button>

        <form onSubmit={handleAddressSubmit} className={`flex-1 flex items-center ${inputBg} rounded-md px-3 py-1 mx-1 min-w-0`}>
          {address ? <Search className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" /> : <Lock className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />}
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={`${profile.firstName.toLowerCase()}.portfolio — search or enter website`}
            aria-label="Address and search bar"
            className={`w-full bg-transparent focus:outline-none text-sm ${textColor} placeholder:text-gray-500`}
          />
        </form>

        <button className={iconButton} onClick={handleRefresh} aria-label="Reload">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-auto">
        {!wifiEnabled ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className={`w-24 h-24 mb-6 flex items-center justify-center rounded-full ${isDarkMode ? "bg-gray-800" : "bg-gray-200"}`}>
              <WifiOff className={`w-12 h-12 ${mutedText}`} />
            </div>
            <h2 className="text-xl font-semibold mb-2">You Are Not Connected to the Internet</h2>
            <p className={`${mutedText} mb-6 max-w-sm`}>
              This page can&apos;t be displayed because your computer is currently offline. Turn Wi-Fi back on from the
              menu bar or Control Center.
            </p>
            <button className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white" onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        ) : (
          <div className={`p-5 sm:p-8 max-w-5xl mx-auto transition-opacity ${isLoading ? "opacity-40" : "opacity-100"}`}>
            {/* Hero */}
            <section className={`mb-10 p-6 rounded-2xl bg-gradient-to-br ${isDarkMode ? "from-blue-900/50 to-purple-900/50" : "from-blue-50 to-purple-50"} border ${borderColor}`}>
              <p className={`text-sm ${mutedText} mb-1`}>Hi, I&apos;m</p>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{profile.name}</h1>
              <p className="text-lg text-blue-500 font-medium mb-3">{profile.role}</p>
              <p className={`${mutedText} max-w-2xl mb-5`}>{profile.bio}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={scrollToProjects}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
                >
                  View Projects
                </button>
                <button
                  onClick={() => openExternal(profile.github.url)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100 border border-gray-300"}`}
                >
                  GitHub Profile
                </button>
              </div>
            </section>

            <section ref={projectsRef} className="mb-10 scroll-mt-4">
              <h2 className="text-2xl font-bold mb-5">My Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{projects.map(renderProjectCard)}</div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Social Links</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">{socialLinks.map(renderTile)}</div>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Frequently Visited</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">{frequentlyVisited.map(renderTile)}</div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
