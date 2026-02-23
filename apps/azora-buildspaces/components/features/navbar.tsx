"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  ChevronDown,
  Code2,
  FileText,
  Palette,
  Brain,
  Terminal,
  Wrench,
  Users,
  ExternalLink,
  X,
  Menu,
  Sparkles,
  BookOpen,
  Building2,
  CreditCard,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CitadelLogoFull } from "@/components/ui/citadel-logo"

const platformItems = [
  {
    icon: Code2,
    title: "Code Chamber",
    description: "Full-stack cloud IDE",
    href: "/features/code-chamber",
    color: "text-emerald-400",
    isNew: false,
  },
  {
    icon: FileText,
    title: "Spec Chamber",
    description: "Requirements & validation",
    href: "/features/spec-chamber",
    color: "text-blue-400",
    isNew: false,
  },
  {
    icon: Palette,
    title: "Design Studio",
    description: "Figma to React",
    href: "/features/design-studio",
    color: "text-purple-400",
    isNew: true,
  },
  {
    icon: Brain,
    title: "AI Studio",
    description: "Agent orchestration",
    href: "/features/ai-studio",
    color: "text-pink-400",
    isNew: false,
  },
  {
    icon: Terminal,
    title: "Command Desk",
    description: "Slash commands",
    href: "/features/command-desk",
    color: "text-amber-400",
    isNew: false,
  },
  {
    icon: Wrench,
    title: "Maker Lab",
    description: "Full-stack scaffolding",
    href: "/features/maker-lab",
    color: "text-rose-400",
    isNew: false,
  },
  {
    icon: Users,
    title: "Collaboration Pod",
    description: "Real-time teamwork",
    href: "/features/collaboration-pod",
    color: "text-cyan-400",
    isNew: false,
  },
  {
    icon: Sparkles,
    title: "AI Agents",
    description: "Meet Elara & team",
    href: "/features/agents",
    color: "text-emerald-400",
    isNew: true,
  },
]

const exploreItems = [
  { title: "Why BuildSpaces", href: "/features", icon: Building2 },
  { title: "Documentation", href: "/docs", icon: BookOpen },
  { title: "BuildSpaces Skills", href: "/features", icon: Sparkles, isNew: true },
  { title: "Blog", href: "/features", icon: FileText },
]

const pricingItems = [
  { title: "Plans & Pricing", href: "/pricing", description: "Compare all plans" },
  { title: "Enterprise", href: "/enterprise", description: "For large organizations" },
  { title: "Contact Sales", href: "/contact", description: "Custom solutions" },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? "border-b border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-xl shadow-lg shadow-black/20"
        : "border-b border-transparent bg-transparent backdrop-blur-sm"
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <CitadelLogoFull size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {/* Products Dropdown - Mega Menu Style */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("products")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:text-white">
              Products <ChevronDown className="h-4 w-4" />
            </button>

            {activeDropdown === "products" && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-[800px] pt-2">
                <div className="rounded-xl border border-white/10 bg-[#161b22] p-6 shadow-2xl">
                  <div className="grid grid-cols-3 gap-6">
                    {/* The 8 Rooms */}
                    <div className="col-span-2">
                      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">The 8 Rooms</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {platformItems.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white/5"
                          >
                            <item.icon className={`h-5 w-5 mt-0.5 ${item.color}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-white">{item.title}</p>
                                {item.isNew && (
                                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">{item.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Explore & Pricing */}
                    <div className="border-l border-white/10 pl-6">
                      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">Explore</h3>
                      <div className="space-y-1">
                        {exploreItems.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <item.icon className="h-4 w-4 text-gray-500" />
                            {item.title}
                            {item.isNew && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                                New
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>

                      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4 mt-6">
                        Plans & Pricing
                      </h3>
                      <div className="space-y-1">
                        {pricingItems.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
                    <Link
                      href="/features"
                      className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
                    >
                      View all features <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Link href="/changelog" className="text-sm text-gray-400 hover:text-white">
                      {"What's"} new?
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/features"
            className="rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:text-white"
          >
            Features
          </Link>
          <Link
            href="/features/agents"
            className="rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:text-white"
          >
            Agents
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:text-white"
          >
            Pricing
          </Link>
          <Link href="/docs" className="rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:text-white">
            Docs
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm hover:border-white/20 transition-colors">
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400">
              ⌘K
            </kbd>
          </button>
          <Button variant="ghost" className="hidden text-gray-300 hover:text-white lg:inline-flex" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button className="bg-emerald-500 text-white hover:bg-emerald-600" asChild>
            <Link href="/auth/signup">
              Get Started <span className="ml-1">→</span>
            </Link>
          </Button>

          {/* Mobile menu button */}
          <button className="lg:hidden text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0d1117]">
          <div className="px-4 py-4 space-y-2">
            {platformItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-3 rounded-lg p-3 text-gray-300 hover:bg-white/5 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span>{item.title}</span>
                {item.isNew && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    New
                  </span>
                )}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-4 mt-4">
              <Link
                href="/pricing"
                className="block px-3 py-2 text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="block px-3 py-2 text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
