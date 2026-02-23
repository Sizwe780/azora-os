import Link from "next/link"
import { CitadelLogoFull } from "@/components/ui/citadel-logo"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import { Github, Twitter, MessageCircle } from "lucide-react"

const footerLinks = {
  Product: [
    { name: "Features", href: "/features" },
    { name: "Code Chamber", href: "/features/code-chamber" },
    { name: "AI Agents", href: "/features/agents" },
    { name: "Pricing", href: "/pricing" },
    { name: "Enterprise", href: "/enterprise" },
  ],
  Resources: [
    { name: "Documentation", href: "/docs" },
    { name: "API Reference", href: "/docs/api" },
    { name: "Tutorials", href: "/tutorials" },
    { name: "Blog", href: "/blog" },
    { name: "Changelog", href: "/changelog" },
  ],
  Company: [
    { name: "About Azora", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Contact", href: "/contact" },
    { name: "Partners", href: "/partners" },
  ],
  Legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Security", href: "/security" },
    { name: "Compliance", href: "/compliance" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0d1117] px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <CitadelLogoFull size="md" className="mb-4" />
            <p className="mb-6 max-w-xs text-sm text-gray-400">
              The AI-powered development environment that transforms your vision into production-ready code. Powered by
              Constitutional AI.
            </p>

            {/* Agent Avatars */}
            <div className="flex gap-2 mb-6">
              {(["elara", "sankofa", "themba", "jabari", "nia", "imani"] as const).map((agent) => (
                <AfricanAgentAvatar key={agent} agent={agent} size="sm" showAura={false} showGlow={false} />
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              99.9% Uptime
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold text-white">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-400 transition-colors hover:text-white">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">© 2026 Azora. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="https://azora.world" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="https://github.com/azora-world" className="text-gray-400 hover:text-white transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://buildspaces.azora.world/chat" className="text-gray-400 hover:text-white transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
