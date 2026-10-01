"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Send, CheckCircle, AlertCircle, Linkedin, Github } from "lucide-react"
import { profile } from "@/lib/profile"

interface MailProps {
  isDarkMode?: boolean
}

const EMPTY_FORM = { name: "", email: "", subject: "", message: "", website: "" }

export default function MailApp({ isDarkMode = true }: MailProps) {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [sentTo, setSentTo] = useState("")

  const textColor = isDarkMode ? "text-white" : "text-gray-800"
  const bgColor = isDarkMode ? "bg-gray-900" : "bg-white"
  const inputBg = isDarkMode ? "bg-gray-800" : "bg-gray-100"
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-300"
  const inputClass = `w-full px-4 py-3 rounded-lg ${inputBg} ${borderColor} border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${textColor} transition-all`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    setErrorMessage("")

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      setSentTo(formData.email)
      setStatus("success")
      setFormData(EMPTY_FORM)
    } catch (error) {
      console.error("Email send error:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to send email. Please try again.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const mailtoLink = `mailto:${profile.email}?subject=${encodeURIComponent(formData.subject || "Hello from your portfolio")}&body=${encodeURIComponent(formData.message)}`

  return (
    <div className={`h-full ${bgColor} ${textColor} flex flex-col`}>
      {/* Header */}
      <div className={`p-4 border-b ${borderColor} flex items-center gap-3`}>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Contact Me</h2>
          <p className="text-sm text-gray-500 truncate">Have a project in mind? Let&apos;s talk.</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center min-h-full text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300 shadow-lg">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Message Sent Successfully!
            </h3>
            <p className="text-gray-500 max-w-md mb-2">
              Thank you for reaching out! I&apos;ll get back to you within 24-48 hours.
            </p>
            <p className="text-sm text-gray-400 max-w-md">
              A confirmation email is on its way to <strong>{sentTo}</strong>.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all hover:scale-105 shadow-lg"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
            {status === "error" && (
              <div
                role="alert"
                className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-300"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-500">Failed to send message</p>
                  <p className="text-sm text-red-400 mt-1">{errorMessage}</p>
                  <p className="text-sm mt-2">
                    You can also{" "}
                    <a href={mailtoLink} className="text-blue-500 underline">
                      email me directly
                    </a>
                    .
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="mail-name" className="block text-sm font-semibold">
                  Your Name *
                </label>
                <input
                  id="mail-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className={inputClass}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="mail-email" className="block text-sm font-semibold">
                  Your Email *
                </label>
                <input
                  id="mail-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={254}
                  className={inputClass}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Honeypot: hidden from people, tempting for spam bots */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="mail-website">Website</label>
              <input
                id="mail-website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="mail-subject" className="block text-sm font-semibold">
                Subject *
              </label>
              <input
                id="mail-subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                maxLength={200}
                className={inputClass}
                placeholder="Project Inquiry / Collaboration / Question"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="mail-message" className="block text-sm font-semibold">
                Message *
              </label>
              <textarea
                id="mail-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                maxLength={5000}
                rows={7}
                className={`${inputClass} resize-none`}
                placeholder="Tell me about your project, inquiry, or how I can help you..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-70 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
            >
              {status === "sending" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending your message...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>

            <div className={`p-5 rounded-lg ${inputBg} border ${borderColor}`}>
              <p className="text-sm font-medium mb-3">Prefer another channel?</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <a
                  href={`mailto:${profile.email}`}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${borderColor} hover:border-blue-500`}
                >
                  <Mail className="w-4 h-4 text-blue-500" /> {profile.email}
                </a>
                <a
                  href={profile.linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${borderColor} hover:border-blue-500`}
                >
                  <Linkedin className="w-4 h-4 text-blue-500" /> LinkedIn
                </a>
                <a
                  href={profile.github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${borderColor} hover:border-blue-500`}
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-3">I typically respond within 24-48 hours.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
