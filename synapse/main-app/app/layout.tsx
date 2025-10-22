import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Azora OS - Africa's First Full Software Infrastructure",
  description: "Built in South Africa by Sizwe Ngwenya. AI-powered compliance, decentralized finance, and enterprise-grade cloud solutions. Learn, earn, and build compliantly.",
  keywords: "Azora OS, African AI, Sizwe Ngwenya, South Africa, compliance, DeFi, enterprise software",
  authors: [{ name: "Sizwe Ngwenya", url: "https://azora.world" }],
  creator: "Sizwe Ngwenya",
  publisher: "Azora OS",
  openGraph: {
    title: "Azora OS - Africa's First Full Software Infrastructure",
    description: "Built in South Africa to showcase African intelligence. AI-powered compliance, decentralized finance, and enterprise-grade cloud solutions.",
    url: "https://azora.world",
    siteName: "Azora OS",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Azora OS - Africa's First Full Software Infrastructure",
    description: "Built in South Africa by Sizwe Ngwenya. AI-powered compliance, decentralized finance, and enterprise-grade cloud solutions.",
    creator: "@azora_os",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0891b2" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}