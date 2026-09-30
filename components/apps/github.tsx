"use client"

import { useEffect, useState } from "react"
import { Github, Star, GitFork, ExternalLink, MapPin, Users, BookOpen } from "lucide-react"
import { profile } from "@/lib/profile"

interface GitHubProps {
  isDarkMode?: boolean
}

interface GitHubUser {
  avatar_url: string
  name: string | null
  login: string
  bio: string | null
  location: string | null
  followers: number
  following: number
  public_repos: number
  html_url: string
}

interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  fork: boolean
  pushed_at: string
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  Java: "#b07219",
  Kotlin: "#A97BFF",
}

// Cached for the whole session so reopening the app doesn't use up the API rate limit
let cache: { user: GitHubUser; repos: GitHubRepo[] } | null = null

export default function GitHub({ isDarkMode = true }: GitHubProps) {
  const [data, setData] = useState(cache)
  const [status, setStatus] = useState<"loading" | "ready" | "error">(cache ? "ready" : "loading")

  useEffect(() => {
    if (cache) return
    const controller = new AbortController()
    const base = `https://api.github.com/users/${profile.github.username}`

    Promise.all([
      fetch(base, { signal: controller.signal }),
      fetch(`${base}/repos?sort=pushed&per_page=100`, { signal: controller.signal }),
    ])
      .then(async ([userResponse, reposResponse]) => {
        if (!userResponse.ok || !reposResponse.ok) throw new Error("GitHub API request failed")
        const user: GitHubUser = await userResponse.json()
        const repos: GitHubRepo[] = await reposResponse.json()
        cache = { user, repos: repos.filter((repo) => !repo.fork) }
        setData(cache)
        setStatus("ready")
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error")
      })

    return () => controller.abort()
  }, [])

  const textColor = isDarkMode ? "text-white" : "text-gray-800"
  const bgColor = isDarkMode ? "bg-[#0d1117]" : "bg-white"
  const cardClass = isDarkMode ? "border-gray-700 hover:border-gray-500" : "border-gray-200 hover:border-gray-400"
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-500"

  const openProfileButton = (
    <a
      href={profile.github.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
    >
      <Github className="w-4 h-4" /> Open on GitHub
    </a>
  )

  if (status !== "ready" || !data) {
    return (
      <div className={`h-full ${bgColor} ${textColor} p-6 flex items-center justify-center`}>
        <div className="text-center">
          <Github className={`w-16 h-16 mx-auto mb-4 ${status === "loading" ? "animate-pulse" : ""}`} />
          <h2 className="text-xl font-semibold mb-2">@{profile.github.username}</h2>
          <p className={`${mutedText} mb-5`}>
            {status === "loading" ? "Loading GitHub profile…" : "Couldn't load the profile right now."}
          </p>
          {openProfileButton}
        </div>
      </div>
    )
  }

  const { user, repos } = data

  return (
    <div className={`h-full ${bgColor} ${textColor} overflow-auto`}>
      <div className="max-w-4xl mx-auto p-5 sm:p-8">
        <header className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8 text-center sm:text-left">
          <img
            src={user.avatar_url}
            alt={`${user.login}'s avatar`}
            className={`w-24 h-24 rounded-full border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold">{user.name ?? profile.name}</h2>
            <p className={`${mutedText} mb-2`}>@{user.login}</p>
            {user.bio && <p className="mb-3">{user.bio}</p>}
            <div className={`flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-sm ${mutedText}`}>
              <span className="inline-flex items-center gap-1">
                <Users className="w-4 h-4" /> {user.followers} followers · {user.following} following
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {user.public_repos} repositories
              </span>
              {(user.location ?? profile.location) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {user.location ?? profile.location}
                </span>
              )}
            </div>
          </div>
          {openProfileButton}
        </header>

        <h3 className="text-lg font-semibold mb-3">Repositories</h3>
        {repos.length === 0 ? (
          <p className={mutedText}>No public repositories yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {repos.map((repo) => (
              <article key={repo.id} className={`border rounded-lg p-4 flex flex-col transition-colors ${cardClass}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-500 hover:underline break-all"
                  >
                    {repo.name}
                  </a>
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`shrink-0 ${mutedText} hover:text-blue-500`}
                      aria-label={`${repo.name} live demo`}
                      title="Live demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className={`text-sm ${mutedText} flex-1 mb-3`}>{repo.description ?? "No description provided."}</p>
                <div className={`flex items-center gap-4 text-xs ${mutedText}`}>
                  {repo.language && (
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: LANGUAGE_COLORS[repo.language] ?? "#8b949e" }}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" /> {repo.stargazers_count}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GitFork className="w-3.5 h-3.5" /> {repo.forks_count}
                  </span>
                  <span className="ml-auto">Updated {new Date(repo.pushed_at).toLocaleDateString()}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
