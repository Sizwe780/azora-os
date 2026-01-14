"use client"

export function CitadelLogo({
  className = "",
  size = "md",
  animated = true,
}: { className?: string; size?: "sm" | "md" | "lg" | "xl"; animated?: boolean }) {
  const sizes = {
    sm: { container: "h-8 w-8", svg: 32 },
    md: { container: "h-10 w-10", svg: 40 },
    lg: { container: "h-14 w-14", svg: 56 },
    xl: { container: "h-20 w-20", svg: 80 },
  }

  const s = sizes[size]

  return (
    <div className={`relative ${className}`}>
      {/* Aether Aura glow effect */}
      <div
        className={`absolute inset-0 ${s.container} rounded-xl bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-500 opacity-60 blur-lg ${animated ? "animate-pulse" : ""}`}
        style={{ transform: "scale(1.3)" }}
      />

      {/* Main logo */}
      <svg viewBox="0 0 64 64" className={`relative ${s.container}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Main gradient */}
          <linearGradient id="citadel-main" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          {/* Inner glow */}
          <radialGradient id="citadel-glow" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>

          {/* Aether energy */}
          <linearGradient id="aether-energy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6EE7B7">
              {animated && (
                <animate
                  attributeName="stop-color"
                  values="#6EE7B7;#34D399;#6EE7B7"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </stop>
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>

        {/* Background circle with gradient */}
        <circle cx="32" cy="32" r="30" fill="url(#citadel-main)" />

        {/* Inner glow */}
        <circle cx="32" cy="32" r="28" fill="url(#citadel-glow)" />

        {/* Citadel tower - main structure */}
        <path
          d="M32 8 L48 20 L48 44 L40 50 L32 44 L24 50 L16 44 L16 20 Z"
          fill="#0d1117"
          stroke="url(#aether-energy)"
          strokeWidth="1.5"
        />

        {/* Central spire */}
        <path d="M32 12 L32 40" stroke="url(#aether-energy)" strokeWidth="2" strokeLinecap="round">
          {animated && <animate attributeName="stroke-opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />}
        </path>

        {/* Left wing */}
        <path d="M20 24 L20 40 L28 36" stroke="#6EE7B7" strokeWidth="1.5" fill="none" opacity="0.8" />

        {/* Right wing */}
        <path d="M44 24 L44 40 L36 36" stroke="#6EE7B7" strokeWidth="1.5" fill="none" opacity="0.8" />

        {/* Energy core */}
        <circle cx="32" cy="28" r="6" fill="#0d1117" stroke="#34D399" strokeWidth="1">
          {animated && <animate attributeName="r" values="6;7;6" dur="2s" repeatCount="indefinite" />}
        </circle>

        {/* Core glow */}
        <circle cx="32" cy="28" r="3" fill="#6EE7B7">
          {animated && <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />}
        </circle>

        {/* Foundation lines */}
        <path d="M16 44 L32 56 L48 44" stroke="#14B8A6" strokeWidth="1.5" fill="none" opacity="0.6" />

        {/* 8 Rooms indicator dots around the citadel */}
        {[0, 51.4, 102.8, 154.3, 205.7, 257.1, 308.5].map((angle, i) => {
          const rad = (angle - 90) * (Math.PI / 180)
          const x = 32 + 26 * Math.cos(rad)
          const y = 32 + 26 * Math.sin(rad)
          return (
            <circle key={i} cx={x} cy={y} r="2" fill="#6EE7B7" opacity="0.8">
              {animated && (
                <animate
                  attributeName="opacity"
                  values="0.8;0.4;0.8"
                  dur="2s"
                  begin={`${i * 0.2}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          )
        })}
      </svg>
    </div>
  )
}

// Full logo with text
export function CitadelLogoFull({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <CitadelLogo size={size} />
      <div className="flex flex-col">
        <span
          className={`font-bold text-white ${size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-base"}`}
        >
          BuildSpaces
        </span>
        <span className="text-[10px] uppercase tracking-wider text-emerald-400/70">by Azora</span>
      </div>
    </div>
  )
}
