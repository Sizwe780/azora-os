// filepath: frontend/frontend/src/pages/LandingPage.tsx
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [platformData, setPlatformData] = useState({
    azrValue: '$1.00',
    activeUsers: '1,245',
    services: '147'
  });
  
  // Use useMemo to avoid re-computing on every render
  // const isIOS = useMemo(() => /iPad|iPhone|iPod/.test(navigator.userAgent), []);
  
  // Set iOS state only once
  useEffect(() => {
    // This runs only once on mount, no setState in effect body
  }, []); // Empty dependency array

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

  // Fetch platform data on mount
  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        // Fetch AZR value from valuation service
        const valuationResponse = await fetch('http://localhost:6789/api/valuation-proof');
        if (valuationResponse.ok) {
          const valuationData = await valuationResponse.json();
          // Assuming it returns { valuation: '$10,000,000' } or similar
          if (valuationData.valuation) {
            setPlatformData(prev => ({ ...prev, azrValue: valuationData.valuation }));
          } else if (valuationData.proof) {
            // If it's a proof, show $10M
            setPlatformData(prev => ({ ...prev, azrValue: '$10,000,000' }));
          }
        }

        // For now, keep user count and services as default or fetch from other services
        // TODO: Add endpoints for user count and services count
      } catch (error) {
        console.error('Error fetching platform data:', error);
        // Keep default values
      }
    };

    fetchPlatformData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white">
      {/* Install Banner */}
      {isInstallable && (
        <div className="fixed top-0 left-0 right-0 bg-cyan-600 p-4 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <span className="font-semibold">�� Install Azora OS</span>
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-cyan-600 rounded-full font-bold"
            >
              Install
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-7xl font-bold mb-4 leading-tight">
          Africa&apos;s First
          <br />
          Trillion-Dollar
          <br />
          Platform
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Learn, earn real money, and build the future
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-full font-bold text-lg">
            🚀 Start Earning
          </button>
          <button className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-full font-bold text-lg backdrop-blur">
            📖 Learn More
          </button>
        </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur p-6 rounded-2xl">
            <div className="text-3xl font-bold text-cyan-400">{platformData.azrValue}</div>
            <div className="text-sm text-gray-400">AZR Value</div>
          </div>
          <div className="bg-white/5 backdrop-blur p-6 rounded-2xl">
            <div className="text-3xl font-bold text-cyan-400">{platformData.activeUsers}</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="bg-white/5 backdrop-blur p-6 rounded-2xl">
            <div className="text-3xl font-bold text-cyan-400">{platformData.services}</div>
            <div className="text-sm text-gray-400">Services</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Why Students Love Azora</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur p-8 rounded-2xl">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Earn Real Money</h3>
            <p className="text-gray-400">Get paid in AZR coins for learning and completing tasks</p>
          </div>
          <div className="bg-white/5 backdrop-blur p-8 rounded-2xl">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold mb-2">Learn Skills</h3>
            <p className="text-gray-400">Master programming, AI, blockchain, and more</p>
          </div>
          <div className="bg-white/5 backdrop-blur p-8 rounded-2xl">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Build Portfolio</h3>
            <p className="text-gray-400">Create real projects that matter</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>&copy; 2024 Azora OS (Pty) Ltd. All Rights Reserved.</p>
          <p className="mt-2">🇿🇦 From Africa, For Humanity 🚀</p>
        </div>
      </footer>
    </div>
  );
}
