import { createContext, useContext, useState } from 'react';
const NotificationCtx = createContext(null);
export function NotificationProvider({ children }) {
  const [list, setList] = useState([]);
  function notify(n) {
    const id = crypto.randomUUID();
    setList(l => [...l, { ...n, id }]);
    setTimeout(() => dismiss(id), 5000);
  }
  function dismiss(id) {
    setList(l => l.filter(n => n.id !== id));
  }
  return (
    <NotificationCtx.Provider value={{ notify, dismiss, list }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {list.map(n => (
          <div key={n.id} className="rounded bg-gray-800/90 shadow p-3 flex justify-between min-w-[240px] max-w-xs items-center text-white">
            <span>{n.message}</span>
            <button onClick={() => dismiss(n.id)} className="ml-4 text-lg">✕</button>
          </div>
        ))}
      </div>
    </NotificationCtx.Provider>
  );
}
export function useNotify() {
  const ctx = useContext(NotificationCtx);
  if (!ctx) throw new Error('useNotify must be used within NotificationProvider');
  return ctx.notify;
}