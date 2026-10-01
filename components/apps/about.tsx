"use client"

import { AppleIcon } from "@/components/icons"
import { useSystem } from "@/components/system-context"
import { profile } from "@/lib/profile"
import { projects } from "@/data/projects"

interface AboutProps {
  isDarkMode?: boolean
}

export default function About({ isDarkMode = true }: AboutProps) {
  const { openApp } = useSystem()

  const specs = [
    { label: "Developer", value: profile.name },
    { label: "Role", value: profile.role },
    { label: "Stack", value: "React · Next.js · Flutter · Node.js" },
    { label: "Location", value: profile.location },
    { label: "Projects", value: `${projects.length} shipped & counting` },
  ]

  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-500"
  const buttonClass = isDarkMode
    ? "bg-gray-700 hover:bg-gray-600 text-white"
    : "bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 py-6 text-center select-none">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg mb-5">
        <AppleIcon className="w-12 h-12 text-white" />
      </div>

      <h2 className="text-2xl font-semibold">MacBook Portfolio</h2>
      <p className={`text-sm ${mutedText} mb-5`}>{profile.firstName}&apos;s Edition, 2026</p>

      <dl className="text-sm space-y-1 mb-6 w-full max-w-xs">
        {specs.map((spec) => (
          <div key={spec.label} className="grid grid-cols-[88px_1fr] gap-3 text-left">
            <dt className={`text-right font-medium`}>{spec.label}</dt>
            <dd className={mutedText}>{spec.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex gap-3">
        <button className={`px-4 py-1 rounded-md text-sm shadow-sm ${buttonClass}`} onClick={() => openApp("notes")}>
          More Info...
        </button>
        <button className={`px-4 py-1 rounded-md text-sm shadow-sm ${buttonClass}`} onClick={() => openApp("mail")}>
          Get in Touch
        </button>
      </div>

      <p className={`text-[11px] ${mutedText} mt-6`}>Built with Next.js, React and Tailwind CSS</p>
    </div>
  )
}
