import React, { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); setVisible(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={handleInstall} className="px-4 py-2 bg-cyan-600 text-white rounded shadow-lg hover:bg-cyan-700">
        Install Azora OS
      </button>
    </div>
  );
}