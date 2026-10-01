import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { profile } from "@/lib/profile"

const title = `${profile.name} | Portfolio`
const description = `Personal portfolio of ${profile.name} - ${profile.role} from ${profile.location}. An interactive macOS-inspired desktop built with Next.js.`

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL to your domain for absolute social-preview URLs (Vercel fills this in automatically)
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title,
  description,
  applicationName: `${profile.firstName}'s Portfolio`,
  authors: [{ name: profile.name, url: profile.github.url }],
  keywords: ["portfolio", "full stack developer", "flutter developer", "next.js", "react", profile.name],
  openGraph: {
    type: "website",
    title,
    description,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "macOS-style portfolio desktop" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
