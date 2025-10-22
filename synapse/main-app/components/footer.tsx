"use client"

import { Github, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    platform: [
      { name: 'Learn & Earn Academy', href: 'https://learn.azora.world' },
      { name: 'AZR Mint', href: 'https://mint.azora.world' },
      { name: 'Forge Marketplace', href: 'https://marketplace.azora.world' },
      { name: 'Compliance Engine', href: 'https://compliance.azora.world' },
      { name: 'Enterprise Portal', href: 'https://enterprise.azora.world' },
      { name: 'Developer Portal', href: 'https://dev.azora.world' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' }
    ],
    resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Community', href: '/community' },
      { name: 'Support', href: '/support' },
      { name: 'Status', href: '/status' },
      { name: 'Security', href: '/security' }
    ]
  }

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AZ</span>
              </div>
              <span className="text-xl font-bold">Azora OS</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Africa's first full software infrastructure. Built in South Africa by Sizwe Ngwenya,
              empowering African innovation through AI, blockchain, and cloud technology.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Johannesburg, South Africa 🇿🇦</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">hello@azora.world</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 p-2" asChild>
                <a href="https://github.com/azora-os" aria-label="GitHub">
                  <Github className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 p-2" asChild>
                <a href="https://twitter.com/azora_os" aria-label="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 p-2" asChild>
                <a href="https://linkedin.com/company/azora-os" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              {links.platform.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Azora OS. All rights reserved. Built with ❤️ in South Africa.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>🇿🇦 Proudly South African</span>
              <span>•</span>
              <span>By Sizwe Ngwenya</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}