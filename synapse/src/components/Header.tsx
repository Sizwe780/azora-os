import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AZ</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Azora OS</span>
            </Link>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AZ</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Azora OS</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/services" className="text-gray-600 hover:text-gray-900 font-medium">
              Services
            </Link>
            <a href="https://learn.azora.world" className="text-gray-600 hover:text-gray-900 font-medium">
              For Students
            </a>
            <a href="https://enterprise.azora.world" className="text-gray-600 hover:text-gray-900 font-medium">
              For Enterprise
            </a>
            <a href="https://dev.azora.world" className="text-gray-600 hover:text-gray-900 font-medium">
              Developers
            </a>
            <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="hidden sm:block">
                    <span className="text-sm text-gray-600">Welcome, {user.name}!</span>
                    {user.role && (
                      <span className="text-xs text-gray-500 capitalize ml-1">({user.role})</span>
                    )}
                    {user.trustScore && (
                      <span className="text-xs text-green-600 ml-1">Trust: {user.trustScore}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Demo Role Selector */}
                <select
                  onChange={(e) => localStorage.setItem('demo_role', e.target.value)}
                  defaultValue="student"
                  className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded text-gray-600"
                >
                  <option value="student">Demo: Student</option>
                  <option value="developer">Demo: Developer</option>
                  <option value="enterprise">Demo: Enterprise</option>
                </select>
                <button
                  onClick={() => login()}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => login()}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 font-medium"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}