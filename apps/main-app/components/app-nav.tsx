"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AzoraLogo } from "./azora-logo"
import { Button } from "./ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"

export function AppNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const apps = [
    { name: "Synapse", href: "/synapse" },
    { name: "Learn", href: "/learn" },
    { name: "Enterprise", href: "/enterprise" },
    { name: "Marketplace", href: "/marketplace" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <AzoraLogo className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Azora OS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {apps.map((app) => (
              <Link
                key={app.href}
                href={app.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname?.startsWith(app.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {app.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-2">
            {apps.map((app) => (
              <Link
                key={app.href}
                href={app.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname?.startsWith(app.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {app.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
