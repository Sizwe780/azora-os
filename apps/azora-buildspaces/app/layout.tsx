import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import SentryInit from "./sentry-client"
import "./globals.css"

export const metadata: Metadata = {
  title: "Citadel BuildSpaces | AI-Powered Development Environment",
  description:
    "Build with AI Agents. Elara orchestrates specialized AI agents to transform your vision into production-ready code. From concept to deployment in minutes.",
  keywords: ["AI development", "code generation", "buildspaces", "azora", "ai agents", "cloud IDE", "pair programming"],
  authors: [{ name: "Azora" }],
  creator: "Azora",
  publisher: "Azora",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://buildspaces.azora.dev",
    siteName: "Citadel BuildSpaces",
    title: "Citadel BuildSpaces | Build with AI Agents",
    description:
      "Elara orchestrates specialized AI agents to transform your vision into production-ready code. From concept to deployment in minutes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Citadel BuildSpaces - AI-Powered Development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Citadel BuildSpaces | Build with AI Agents",
    description: "Transform your vision into production-ready code with AI agents.",
    images: ["/og-image.png"],
    creator: "@azora",
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: "Azora BuildSpaces",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d1117" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#0d1117] text-white">
        <SentryInit />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
