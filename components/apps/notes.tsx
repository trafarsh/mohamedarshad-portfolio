"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, Pencil, Check } from "lucide-react"
import { profile, skills } from "@/lib/profile"
import { projects } from "@/data/projects"

interface NotesProps {
  isDarkMode?: boolean
}

interface Note {
  id: number
  title: string
  content: string
  date: string
}

const aboutMe = `# ${profile.name}
${profile.role}

${profile.bio}

## Skills
${Object.entries(skills)
  .map(([group, items]) => `### ${group}\n${items.map((item) => `- ${item}`).join("\n")}`)
  .join("\n\n")}

## Experience
Senior Full Stack & Flutter Developer based in Coimbatore, India. Specializing in building scalable web and mobile applications with modern technologies. Experienced in delivering end-to-end solutions from concept to deployment.

## Projects
${projects.map((project) => `- ${project.title} — ${project.liveUrl}`).join("\n")}

## Contact
Email: ${profile.email}
GitHub: ${profile.github.url}
LinkedIn: ${profile.linkedin.url}
Location: ${profile.location}`

const services = `# Services & Pricing

## Web Development
- Custom Website Development
- E-Commerce Solutions
- Progressive Web Apps (PWA)
- API Development & Integration

## Mobile App Development
- Flutter iOS & Android Apps
- Cross-Platform Solutions
- App Store Deployment
- Maintenance & Support

## Full Stack Solutions
- End-to-End Development
- Database Design
- Cloud Integration
- Performance Optimization

## Pricing
- Hourly Rate: Competitive rates
- Project-Based: Custom quotes
- Retainer: Monthly packages available

Contact for detailed pricing and project discussion.`

const initialNotes: Note[] = [
  { id: 1, title: "About Me", content: aboutMe, date: "Today, 10:30 AM" },
  { id: 2, title: "Services & Pricing", content: services, date: "Yesterday, 3:15 PM" },
]

// Renders inline URLs and emails as links
function renderInline(text: string): React.ReactNode[] {
  return text.split(/(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+\.[\w.]+)/g).map((part, index) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
          {part}
        </a>
      )
    }
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part)) {
      return (
        <a key={index} href={`mailto:${part}`} className="text-blue-500 hover:underline">
          {part}
        </a>
      )
    }
    return part
  })
}

// A tiny markdown renderer for headings, bullet lists and paragraphs
function NoteView({ content, isDarkMode }: { content: string; isDarkMode: boolean }) {
  const blocks: React.ReactNode[] = []
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length === 0) return
    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc pl-6 mb-3 space-y-0.5">
        {listItems.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    )
    listItems = []
  }

  content.split("\n").forEach((line, index) => {
    if (line.startsWith("- ")) {
      listItems.push(line.slice(2))
      return
    }
    flushList()

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={index} className="text-base font-semibold mt-3 mb-1">
          {line.slice(4)}
        </h3>,
      )
    } else if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={index} className="text-xl font-bold mt-5 mb-2">
          {line.slice(3)}
        </h2>,
      )
    } else if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={index} className="text-2xl font-bold mb-1">
          {line.slice(2)}
        </h1>,
      )
    } else if (line.trim()) {
      blocks.push(
        <p key={index} className={`mb-2 leading-relaxed ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          {renderInline(line)}
        </p>,
      )
    }
  })
  flushList()

  return <div className="max-w-2xl">{blocks}</div>
}

export default function Notes({ isDarkMode = true }: NotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [selectedNoteId, setSelectedNoteId] = useState(1)
  const [isEditing, setIsEditing] = useState(false)

  const selectedNote = notes.find((note) => note.id === selectedNoteId)

  const handleNoteSelect = (id: number) => {
    setSelectedNoteId(id)
    setIsEditing(false)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    const firstLine = content.split("\n").find((line) => line.trim()) ?? ""
    setNotes((prev) =>
      prev.map((note) =>
        note.id === selectedNoteId
          ? { ...note, content, title: firstLine.replace(/^#+\s*/, "").slice(0, 60) || "New Note" }
          : note,
      ),
    )
  }

  const createNote = () => {
    const id = Math.max(0, ...notes.map((n) => n.id)) + 1
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    setNotes((prev) => [{ id, title: "New Note", content: "", date: `Today, ${time}` }, ...prev])
    setSelectedNoteId(id)
    setIsEditing(true)
  }

  const deleteNote = (id: number) => {
    const remaining = notes.filter((note) => note.id !== id)
    setNotes(remaining)
    setSelectedNoteId(remaining[0]?.id ?? 0)
    setIsEditing(false)
  }

  const textColor = isDarkMode ? "text-white" : "text-gray-800"
  const bgColor = isDarkMode ? "bg-gray-900" : "bg-white"
  const sidebarBg = isDarkMode ? "bg-gray-800" : "bg-gray-100"
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200"
  const hoverBg = isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
  const selectedBg = isDarkMode ? "bg-yellow-600/40" : "bg-yellow-200"
  const iconButton = `w-7 h-7 rounded-md flex items-center justify-center ${hoverBg}`

  return (
    <div className={`flex h-full ${bgColor} ${textColor}`}>
      {/* Sidebar */}
      <div className={`w-36 sm:w-60 shrink-0 ${sidebarBg} border-r ${borderColor} flex flex-col`}>
        <div className={`p-3 border-b ${borderColor} flex justify-between items-center`}>
          <h2 className="font-medium">Notes</h2>
          <button className={iconButton} onClick={createNote} aria-label="New note" title="New note">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-1.5 space-y-1">
          {notes.map((note) => (
            <button
              key={note.id}
              className={`w-full text-left p-2.5 rounded-md ${selectedNoteId === note.id ? selectedBg : hoverBg}`}
              onClick={() => handleNoteSelect(note.id)}
            >
              <h3 className="font-medium truncate text-sm">{note.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{note.date}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Note content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNote ? (
          <>
            <div className={`px-4 py-2 border-b ${borderColor} flex items-center justify-between gap-2`}>
              <p className="text-xs text-gray-500 truncate">{selectedNote.date}</p>
              <div className="flex gap-1">
                <button
                  className={iconButton}
                  onClick={() => setIsEditing(!isEditing)}
                  aria-label={isEditing ? "Done editing" : "Edit note"}
                  title={isEditing ? "Done" : "Edit"}
                >
                  {isEditing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
                <button
                  className={iconButton}
                  onClick={() => deleteNote(selectedNote.id)}
                  aria-label="Delete note"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 sm:p-6 overflow-auto">
              {isEditing ? (
                <textarea
                  className={`w-full h-full resize-none ${bgColor} ${textColor} focus:outline-none font-mono text-sm`}
                  value={selectedNote.content}
                  onChange={handleContentChange}
                  placeholder="Start typing… (# Heading, - bullet)"
                  aria-label="Note content"
                  autoFocus
                />
              ) : selectedNote.content.trim() ? (
                <NoteView content={selectedNote.content} isDarkMode={isDarkMode} />
              ) : (
                <p className="text-gray-500 text-sm">Empty note — click the pencil to write something.</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">No note selected</div>
        )}
      </div>
    </div>
  )
}
