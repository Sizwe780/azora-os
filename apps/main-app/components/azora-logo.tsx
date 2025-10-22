export function AzoraLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Azora OS Logo"
    >
      {/* Neural network node structure forming an "A" */}
      <circle cx="50" cy="20" r="8" fill="currentColor" className="opacity-90" />
      <circle cx="30" cy="50" r="8" fill="currentColor" className="opacity-90" />
      <circle cx="70" cy="50" r="8" fill="currentColor" className="opacity-90" />
      <circle cx="30" cy="80" r="8" fill="currentColor" className="opacity-90" />
      <circle cx="70" cy="80" r="8" fill="currentColor" className="opacity-90" />
      <circle cx="50" cy="65" r="6" fill="currentColor" className="opacity-70" />

      {/* Connecting synapses */}
      <line x1="50" y1="20" x2="30" y2="50" stroke="currentColor" strokeWidth="2" className="opacity-60" />
      <line x1="50" y1="20" x2="70" y2="50" stroke="currentColor" strokeWidth="2" className="opacity-60" />
      <line x1="30" y1="50" x2="30" y2="80" stroke="currentColor" strokeWidth="2" className="opacity-60" />
      <line x1="70" y1="50" x2="70" y2="80" stroke="currentColor" strokeWidth="2" className="opacity-60" />
      <line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="2" className="opacity-60" />
      <line x1="30" y1="50" x2="50" y2="65" stroke="currentColor" strokeWidth="1.5" className="opacity-40" />
      <line x1="70" y1="50" x2="50" y2="65" stroke="currentColor" strokeWidth="1.5" className="opacity-40" />

      {/* Glow effect */}
      <circle cx="50" cy="20" r="12" fill="currentColor" className="opacity-20 blur-sm" />
      <circle cx="50" cy="65" r="10" fill="currentColor" className="opacity-20 blur-sm" />
    </svg>
  )
}
