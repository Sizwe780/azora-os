"use client"
import { Sparkles, Github, Twitter, Linkedin, Heart, Code2, Palette, Brain, Database } from "lucide-react"
import Link from "next/link"

const footerLinks = {
  Product: [
    { label: "Code Chamber", href: "/code-chamber" },
    { label: "Design Studio", href: "/design-studio" },
    { label: "AI Lab", href: "/ai-lab" },
    { label: "Data Forge", href: "/data-forge" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs/api" },
    { label: "Tutorials", href: "/tutorials" },
    { label: "Blog", href: "/blog" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/security" },
    { label: "Status", href: "/status" },
  ],
}

const productIcons = [
  { icon: Code2, href: "/code-chamber", label: "Code Chamber", color: "text-primary" },
  { icon: Palette, href: "/design-studio", label: "Design Studio", color: "text-pink-500" },
  { icon: Brain, href: "/ai-lab", label: "AI Lab", color: "text-accent" },
  { icon: Database, href: "/data-forge", label: "Data Forge", color: "text-amber-500" },
]

export function FooterSection() {
  return (
    <footer className="relative border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <span className="font-bold text-foreground">BuildSpaces</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">AI-powered development platform by Azora.</p>

            {/* Product Icons */}
            <div className="flex items-center gap-2 mb-4">
              {productIcons.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center ${item.color} transition-colors`}
                  title={item.label}
                >
                  <item.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Azora-OS"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/AzoraOS"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/azora-os"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Ubuntu Philosophy Banner */}
        <div className="mb-8 p-4 rounded-xl bg-muted/30 border border-border text-center">
          <p className="text-sm text-muted-foreground italic">
            "Ubuntu: I am because we are" — Our AI agents embody collective intelligence, working together to bring your
            vision to life.
          </p>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Azora ES (Pty) Ltd. All rights reserved.</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built with <Heart className="w-4 h-4 text-red-500" /> using Ubuntu Philosophy
          </p>
        </div>
      </div>
    </footer>
  )
}
