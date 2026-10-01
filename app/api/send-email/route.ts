import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { profile } from "@/lib/profile"

const LIMITS = { name: 100, email: 254, subject: 200, message: 5000 }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Best-effort, per-instance rate limit to slow down abuse of the contact form
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const recentRequests = new Map<string, number[]>()

function isRateLimited(ip: string) {
  const now = Date.now()
  const timestamps = (recentRequests.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  timestamps.push(now)
  recentRequests.set(ip, timestamps)

  // Keep the map from growing forever on long-lived instances
  if (recentRequests.size > 1000) {
    for (const [key, times] of recentRequests) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) recentRequests.delete(key)
    }
  }

  return timestamps.length > RATE_LIMIT_MAX
}

// User input must never be inserted into email HTML unescaped
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "")

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  // Honeypot field: real visitors never see or fill it, bots usually do
  if (asString(body.website)) {
    return NextResponse.json({ message: "Email sent successfully!" }, { status: 200 })
  }

  const name = asString(body.name)
  const email = asString(body.email)
  const subject = asString(body.subject)
  const message = asString(body.message)

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  if (!EMAIL_PATTERN.test(email) || email.length > LIMITS.email) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
  }

  if (name.length > LIMITS.name || subject.length > LIMITS.subject || message.length > LIMITS.message) {
    return NextResponse.json({ error: "Your message is too long" }, { status: 400 })
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 })
  }

  const gmailUser = process.env.GMAIL_USER
  const gmailPassword = process.env.GMAIL_APP_PASSWORD
  if (!gmailUser || !gmailPassword) {
    console.error("Contact form: GMAIL_USER / GMAIL_APP_PASSWORD are not configured")
    return NextResponse.json({ error: "The contact form is temporarily unavailable" }, { status: 503 })
  }

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    subject: escapeHtml(subject),
    message: escapeHtml(message).replace(/\n/g, "<br>"),
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPassword },
    })

    // Email to you (the inquiry)
    await transporter.sendMail({
      from: gmailUser,
      to: gmailUser,
      replyTo: email, // When you reply, it goes to the sender
      subject: `New Contact from Portfolio - ${name.replace(/[\r\n]+/g, " ")}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .value { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📧 New Contact Form Submission</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">From your portfolio website</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Name:</div>
                <div class="value">${safe.name}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email:</div>
                <div class="value"><a href="mailto:${safe.email}">${safe.email}</a></div>
              </div>
              <div class="field">
                <div class="label">📋 Subject:</div>
                <div class="value">${safe.subject}</div>
              </div>
              <div class="field">
                <div class="label">💬 Message:</div>
                <div class="value">${safe.message}</div>
              </div>
              <div class="footer">
                <p>Sent from your portfolio contact form</p>
                <p>Reply directly to this email to respond to ${safe.name}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // Auto-reply to the sender. It deliberately does not echo the submitted subject/message,
    // so the form can't be abused to send arbitrary content to third-party addresses.
    // A failed auto-reply shouldn't report the whole submission as failed — the inquiry was delivered.
    await transporter.sendMail({
      from: gmailUser,
      to: email,
      subject: `Thank you for contacting ${profile.name}`,
      text: `Hi ${name},\n\nThank you for reaching out! I've received your message and will get back to you within 24-48 hours.\n\nBest regards,\n${profile.name}\n${profile.role}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; }
            .signature { margin-top: 20px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✅ Message Received!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for reaching out</p>
            </div>
            <div class="content">
              <p>Hi <strong>${safe.name}</strong>,</p>
              <p>Thank you for contacting me! I've received your message and will get back to you as soon as possible, usually within 24-48 hours.</p>

              <p>If you have any urgent queries, feel free to reach out to me directly at:</p>
              <ul>
                <li>📧 Email: ${profile.email}</li>
                <li>💼 LinkedIn: <a href="${profile.linkedin.url}">${profile.name}</a></li>
                <li>🔗 GitHub: <a href="${profile.github.url}">@${profile.github.username}</a></li>
              </ul>

              <div class="signature">
                <p>Best regards,<br>
                <strong>${profile.name}</strong><br>
                ${profile.role}<br>
                ${profile.location}</p>
              </div>

              <div class="footer">
                <p style="font-size: 12px; color: #999;">
                  This is an automated response. Please do not reply to this email.<br>
                  If you need immediate assistance, please send a new email to ${profile.email}
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }).catch((error: unknown) => console.error("Auto-reply send error:", error))

    return NextResponse.json({ message: "Email sent successfully!" }, { status: 200 })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json({ error: "Failed to send email. Please try again later." }, { status: 500 })
  }
}
