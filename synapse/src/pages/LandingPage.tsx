import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS] = useState(/iPad|iPhone|iPod/.test(navigator.userAgent));

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('✅ SW registered'))
        .catch((err) => console.error('❌ SW failed:', err));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') console.log('✅ Installed');
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white">
      {/* Install Banner */}
      {isInstallable && (
        <div className="fixed top-0 left-0 right-0 bg-cyan-600 p-4 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <span className="font-semibold">📱 Install Azora OS</span>
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-cyan-600 rounded-full font-bold"
            >
              Install
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌍</span>
            <span className="text-xl font-bold">AZORA</span>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-sm font-semibold">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-7xl font-bold mb-4 leading-tight">
          Africa&apos;s First
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Trillion-Dollar
          </span>
          <br />
          Platform
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Learn, earn real money, and build the future
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-lg shadow-2xl">
            🚀 Start Earning
          </button>
          <button className="px-8 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-full font-bold text-lg">
            📖 Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { emoji: '⚡', value: '$1.00', label: 'AZR Value' },
            { emoji: '👥', value: '1,245', label: 'Active Users' },
            { emoji: '🛡️', value: '147', label: 'Services' }
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
              <div className="text-3xl mb-2">{stat.emoji}</div>
              <div className="text-3xl font-bold text-cyan-400">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Why Students Love Azora</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '💰', title: 'Earn Real Money', desc: 'Get paid in AZR tokens' },
            { emoji: '📚', title: 'Learn Skills', desc: 'Master tech skills' },
            { emoji: '🚀', title: 'Build Portfolio', desc: 'Real projects' }
          ].map((f, i) => (
            <div key={i} className="p-6 bg-white/5 rounded-2xl">
              <div className="text-4xl mb-3">{f.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>© 2024 Azora OS (Pty) Ltd. All Rights Reserved.</p>
          <p className="text-cyan-400 mt-2">🇿🇦 From Africa, For Humanity 🚀</p>
        </div>
      </footer>
    </div>
  );
}
