import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS); // eslint-disable-line react-hooks/set-state-in-effect // eslint-disable-line react-hooks/set-state-in-effect

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('✅ Service Worker registered'))
        .catch(err => console.error('❌ SW registration failed:', err));
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ User installed the app');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white">
      {/* Install Banner */}
      {isInstallable && (
        <div className="fixed top-0 left-0 right-0 bg-cyan-600 text-white p-4 z-50 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📱</span>
              <span className="font-semibold">Install Azora OS</span>
            </div>
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-cyan-600 rounded-full font-bold text-sm"
            >
              Install Now
            </button>
          </div>
        </div>
      )}

      {/* iOS Install Instructions */}
      {isIOS && !window.matchMedia('(display-mode: standalone)').matches && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 z-50">
          <div className="container mx-auto text-center text-sm">
            <p className="font-semibold mb-2">📲 Install on iOS</p>
            <p>Tap <span className="inline-block">⎙</span> Share, then "Add to Home Screen"</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🌍</span>
            <span className="text-xl font-bold">AZORA</span>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-sm font-semibold">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-7xl font-bold mb-4 leading-tight">
          Africa's First
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Trillion-Dollar
          </span>
          <br />
          Platform
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Learn, earn real money, and build the future with Azora OS
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-lg shadow-2xl active:scale-95 transition">
            🚀 Start Earning Now
          </button>
          <button className="px-8 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-full font-bold text-lg active:scale-95 transition">
            📖 Learn More
          </button>
        </div>

        {/* Live Stats - Mobile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-3xl font-bold text-cyan-400">$1.00</div>
            <div className="text-sm text-gray-400">AZR Value</div>
            <div className="text-xs text-green-400 mt-1">↗ Growing to $1M</div>
          </div>
          
          <div className="p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-3xl font-bold text-purple-400">1,245</div>
            <div className="text-sm text-gray-400">Active Users</div>
            <div className="text-xs text-green-400 mt-1">↗ Live</div>
          </div>
          
          <div className="p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-3xl font-bold text-green-400">147</div>
            <div className="text-sm text-gray-400">Services</div>
            <div className="text-xs text-green-400 mt-1">✓ 100% Up</div>
          </div>
        </div>
      </section>

      {/* Features - Mobile Cards */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Why Students Love Azora
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { emoji: '💰', title: 'Earn Real Money', desc: 'Get paid in AZR tokens worth real USD' },
            { emoji: '📚', title: 'Learn Skills', desc: 'Master tech skills that companies need' },
            { emoji: '🚀', title: 'Build Portfolio', desc: 'Work on real projects, not tutorials' },
            { emoji: '🌍', title: '100% African', desc: 'Built by Africans, owned by Africans' },
            { emoji: '🔒', title: 'Secure', desc: 'Bank-grade security, blockchain verified' },
            { emoji: '📱', title: 'Mobile First', desc: 'Works perfectly on any device, offline too' }
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10 active:scale-95 transition"
            >
              <div className="text-4xl mb-3">{feature.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Mobile Steps */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Start Earning in 3 Steps
        </h2>
        
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            { step: '1', title: 'Sign Up Free', desc: 'Get 10 AZR ($10) instant bonus' },
            { step: '2', title: 'Complete Tasks', desc: 'Learn, build, earn 1-50 AZR daily' },
            { step: '3', title: 'Withdraw Money', desc: 'Cash out anytime to your bank' }
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start space-x-4 p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
                {item.step}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full font-bold text-lg shadow-2xl active:scale-95 transition">
            💸 Start Earning Now →
          </button>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur rounded-3xl p-8 border border-white/10">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">⭐⭐⭐⭐⭐</div>
            <p className="text-xl font-semibold mb-2">Loved by 1,000+ Students</p>
            <p className="text-gray-400 text-sm">Average rating: 4.9/5</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { name: 'Thabo M.', text: 'Earned 150 AZR in my first month!', location: 'Johannesburg' },
              { name: 'Amara N.', text: 'Finally making money while learning', location: 'Lagos' },
              { name: 'Kwame A.', text: 'Best decision I ever made', location: 'Accra' }
            ].map((review, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl text-sm">
                <p className="mb-2 italic">"{review.text}"</p>
                <p className="font-semibold">{review.name}</p>
                <p className="text-xs text-gray-400">{review.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Mobile Friendly */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <h4 className="font-bold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/learn">Learn</a></li>
                <li><a href="/earn">Earn</a></li>
                <li><a href="/wallet">Wallet</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about">About</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/press">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/privacy">Privacy</a></li>
                <li><a href="/terms">Terms</a></li>
                <li><a href="/constitution">Constitution</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://twitter.com/AzoraOS">Twitter</a></li>
                <li><a href="https://discord.gg/azora">Discord</a></li>
                <li><a href="mailto:hello@azora.world">Email</a></li>
              </ul>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-400 border-t border-white/10 pt-6">
            <p className="mb-2">© 2024 Azora OS (Pty) Ltd. All Rights Reserved.</p>
            <p className="text-cyan-400">🇿🇦 From Africa, For Humanity, Towards Infinity 🚀</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
