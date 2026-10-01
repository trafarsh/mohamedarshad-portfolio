"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSystem } from "@/components/system-context"
import { listedApps } from "@/lib/apps"
import { profile, skills } from "@/lib/profile"
import { projects } from "@/data/projects"

interface TerminalProps {
  isDarkMode?: boolean
}

const PROMPT = `${profile.username}@macbook-pro ~ %`

const FILES: Record<string, string> = {
  "about.txt": "about",
  "skills.txt": "skills",
  "projects.md": "projects",
  "contact.txt": "contact",
}

const COMMANDS = [
  "help",
  "about",
  "skills",
  "projects",
  "contact",
  "social",
  "open",
  "neofetch",
  "ls",
  "cat",
  "pwd",
  "whoami",
  "date",
  "echo",
  "history",
  "clear",
  "sudo",
]

const box = (title: string) => {
  const line = "─".repeat(title.length + 2)
  return [`┌${line}┐`, `│ ${title} │`, `└${line}┘`]
}

// Renders URLs and email addresses in terminal output as clickable links
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+\.[\w.]+)/g)
  return (
    <>
      {parts.map((part, index) => {
        if (/^https?:\/\//.test(part)) {
          return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-200">
              {part}
            </a>
          )
        }
        if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part)) {
          return (
            <a key={index} href={`mailto:${part}`} className="underline hover:text-green-200">
              {part}
            </a>
          )
        }
        return part
      })}
    </>
  )
}

export default function Terminal(_props: TerminalProps) {
  const { openApp } = useSystem()
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  // -1 = editing a new command; 0 = most recent command, 1 = the one before, ...
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHistory([
      `Last login: ${new Date().toLocaleString()} on ttys000`,
      `Welcome to ${profile.firstName}'s portfolio terminal!`,
      "Type 'help' to see available commands.",
      "",
    ])
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const outputFor = (topic: string): string[] => {
    switch (topic) {
      case "about":
        return [...box(`${profile.name} — ${profile.role}`), "", profile.bio, ""]
      case "skills":
        return [
          ...box("Skills"),
          "",
          ...Object.entries(skills).flatMap(([group, items]) => [`${group}:`, ...items.map((item) => `  • ${item}`), ""]),
        ]
      case "projects":
        return [
          ...box("Projects"),
          "",
          ...projects.flatMap((project) => [
            `▸ ${project.title}  [${project.category}]`,
            `  ${project.description}`,
            `  Tech:   ${project.technologies.join(", ")}`,
            `  Live:   ${project.liveUrl}`,
            `  Code:   ${project.githubUrl}`,
            "",
          ]),
        ]
      case "contact":
        return [
          ...box("Contact"),
          "",
          `Email:    ${profile.email}`,
          `GitHub:   ${profile.github.url}`,
          `LinkedIn: ${profile.linkedin.url}`,
          `Location: ${profile.location}`,
          "",
          "Tip: run 'open mail' to send me a message right here.",
          "",
        ]
      default:
        return []
    }
  }

  const executeCommand = (rawCommand: string) => {
    const trimmed = rawCommand.trim()
    const [name = "", ...args] = trimmed.split(/\s+/)
    const command = name.toLowerCase()
    const argText = trimmed.slice(name.length).trim()

    const print = (...lines: string[]) => setHistory((prev) => [...prev, ...lines])

    setHistory((prev) => [...prev, `${PROMPT} ${rawCommand}`])

    switch (command) {
      case "help":
        print(
          "Available commands:",
          "  about             About me",
          "  skills            My technical skills",
          "  projects          Things I've built",
          "  contact           How to reach me",
          "  social            Social profiles",
          "  open <app>        Open an app (e.g. open safari)",
          "  neofetch          System information",
          "  ls, cat <file>    Browse my files",
          "  echo <text>       Print text",
          "  pwd, whoami, date, history, clear",
          "",
          "Tips: ↑/↓ browse previous commands, Tab completes.",
          "",
        )
        break

      case "about":
      case "skills":
      case "projects":
      case "contact":
        print(...outputFor(command))
        break

      case "social":
        print(`GitHub:   ${profile.github.url}`, `LinkedIn: ${profile.linkedin.url}`, "")
        break

      case "open": {
        const target = args[0]?.toLowerCase()
        const app = listedApps.find((a) => a.id === target || a.title.toLowerCase() === target)
        if (!target) {
          print("usage: open <app>", `apps: ${listedApps.map((a) => a.id).join(", ")}`, "")
        } else if (app) {
          print(`Opening ${app.title}...`, "")
          openApp(app.id)
        } else {
          print(`open: no such app: ${args[0]}`, `apps: ${listedApps.map((a) => a.id).join(", ")}`, "")
        }
        break
      }

      case "neofetch":
        print(
          `        .:'          ${profile.username}@macbook-pro`,
          `     __ :'__         -------------------`,
          `  .'\`__\`-'__\`\`.     OS: macOS Portfolio (Next.js)`,
          ` :__________.-'      Host: ${profile.name}`,
          ` :_________:         Role: ${profile.role}`,
          `  :_________\`-;      Location: ${profile.location}`,
          `   \`.__.-.__.'       Shell: zsh (simulated)`,
          `                     Projects: ${projects.length}`,
          `                     Stack: React, Next.js, Flutter, Node.js`,
          "",
        )
        break

      case "ls":
        print(Object.keys(FILES).join("    "), "")
        break

      case "cat": {
        const file = args[0]
        if (!file) print("usage: cat <file>", "")
        else if (FILES[file]) print(...outputFor(FILES[file]))
        else print(`cat: ${file}: No such file or directory`, "")
        break
      }

      case "pwd":
        print(`/Users/${profile.username}`, "")
        break

      case "whoami":
        print(profile.username, "")
        break

      case "date":
        print(new Date().toString(), "")
        break

      case "echo":
        // Keep the original casing of the text
        print(argText, "")
        break

      case "history":
        print(...[...commandHistory, rawCommand].map((cmd, i) => `${String(i + 1).padStart(4)}  ${cmd}`), "")
        break

      case "clear":
        setHistory([])
        break

      case "sudo":
        print(`${profile.username} is not in the sudoers file. This incident will be reported. 😉`, "")
        break

      case "":
        break

      default:
        print(`zsh: command not found: ${name}`, "Type 'help' to see available commands.", "")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input)
      if (input.trim()) setCommandHistory((prev) => [...prev, input])
      setHistoryIndex(-1)
      setInput("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(newIndex)
      setInput(commandHistory[commandHistory.length - 1 - newIndex])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex <= 0) {
        setHistoryIndex(-1)
        setInput("")
      } else {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      const [first, ...rest] = input.split(" ")
      if (rest.length === 0) {
        const matches = COMMANDS.filter((cmd) => cmd.startsWith(first.toLowerCase()))
        if (matches.length === 1) setInput(`${matches[0]} `)
        else if (matches.length > 1) setHistory((prev) => [...prev, `${PROMPT} ${input}`, matches.join("  ")])
      } else {
        const partial = rest.join(" ").toLowerCase()
        const candidates = first === "open" ? listedApps.map((a) => a.id) : first === "cat" ? Object.keys(FILES) : []
        const matches = candidates.filter((c) => c.startsWith(partial))
        if (matches.length === 1) setInput(`${first} ${matches[0]}`)
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      setHistory([])
    }
  }

  return (
    <div
      ref={terminalRef}
      className="h-full bg-[#1e1e1e] text-green-400 p-3 font-mono text-[13px] leading-relaxed overflow-auto cursor-text"
      onClick={() => {
        // Don't steal focus when the user is selecting text to copy
        if (!window.getSelection()?.toString()) inputRef.current?.focus()
      }}
    >
      {history.map((line, index) => (
        <div key={index} className="whitespace-pre-wrap break-words min-h-[1.25em]">
          <Linkified text={line} />
        </div>
      ))}

      <div className="flex">
        <span className="mr-2 shrink-0 text-cyan-400">{PROMPT}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-transparent outline-none caret-green-400 text-green-400"
          aria-label="Terminal input"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus
        />
      </div>
    </div>
  )
}
