import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

const Sidebar = () => {
  const location = useLocation()
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Subscription', href: '/subscription', icon: '💳' },
    {
      name: 'Services',
      href: '#',
      icon: '🔧',
      children: [
        { name: 'Retail Partner', href: '/services/retail-partner' },
        { name: 'EV Leader', href: '/services/ev-leader' },
        { name: 'Neural Context', href: '/services/neural-context' },
        { name: 'Safety Orchestrator', href: '/services/safety-orchestrator' },
        { name: 'Cold Chain', href: '/services/cold-chain' },
        { name: 'Tracking Engine', href: '/services/tracking-engine' },
        { name: 'Deep Mind', href: '/services/deep-mind' },
        { name: 'Analytics', href: '/services/analytics' },
        { name: 'Compliance', href: '/services/compliance' },
        { name: 'Document Vault', href: '/services/document-vault' },
        { name: 'Maintenance', href: '/services/maintenance' },
        { name: 'Employee Onboarding', href: '/services/employee-onboarding' },
        { name: 'Traffic Routing', href: '/services/traffic-routing' },
        { name: 'Crypto Ledger', href: '/services/crypto-ledger' },
        { name: 'Trip Planning', href: '/services/trip-planning' },
        { name: 'TMS', href: '/services/tms' },
        { name: 'Klipp', href: '/services/klipp' },
        { name: 'Admin', href: '/services/admin' },
        { name: 'Driver Behavior', href: '/services/driver-behavior' },
        { name: 'Document Verification', href: '/services/document-verification' },
        { name: 'AI Evolution', href: '/services/ai-evolution' },
        { name: 'Accessibility', href: '/services/accessibility' },
        { name: 'HR Deputy', href: '/services/hr-deputy' },
        { name: 'AI Assistant', href: '/services/ai-assistant' }
      ]
    }
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Azora OS</h1>
          <p className="text-sm text-muted-foreground">Sovereign Operating System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div className="space-y-1">
                  <div className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground">
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </div>
                  <div className="ml-6 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                          location.pathname === child.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-accent'
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <span className="mr-3">{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <span className="mr-3">🚪</span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar