import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd validate credentials here.
    const storage = globalThis.sessionStorage;
    storage?.setItem('azora-auth', 'true');
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950 dark:to-black">
      <GlassCard className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <img src="/azora-logo.svg" alt="Azora OS" className="w-24 drop-shadow-lg" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">Welcome to Azora OS</h1>
        <p className="text-center text-gray-600 dark:text-white/70 mb-8">The sovereign nervous system for your operations.</p>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80">Email Address</label>
            <input
              type="email"
              className="mt-1 block w-full bg-white/50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-md shadow-sm py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@company.com"
              defaultValue="pilot@azora.world"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80">Password</label>
            <input
              type="password"
              className="mt-1 block w-full bg-white/50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-md shadow-sm py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              defaultValue="password"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all"
          >
            Sign In
          </button>
        </form>
        <div className="mt-8 text-center">
          <a href="#" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Forgot your password?
          </a>
        </div>
      </GlassCard>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
