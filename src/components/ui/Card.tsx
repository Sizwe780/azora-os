import React from 'react';

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white/5 border border-white/10 shadow p-4 space-y-3">
      <h2 className="font-semibold text-white/90">{title}</h2>
      {children}
    </section>
  );
}
