"use client";

import { useMemo } from "react";
import clsx from "clsx";
import Image from "next/image";

export type Persona = "elara" | "themba";
export type AvatarState = "idle" | "thinking" | "guiding" | "verifying" | "reviewing";

interface AvatarProps {
    persona: Persona;
    size?: number;
    state?: AvatarState;
    className?: string;
    useRealImage?: boolean;
}

/**
 * Avatar component with Aether Aura and motion states
 * Features "Golden Android" avatars with specific refinements for Elara
 */
export function Avatar({
    persona,
    size = 48,
    state = "idle",
    className,
    useRealImage = false
}: AvatarProps) {
    const src = useMemo(
        () => {
            if (useRealImage) {
                return persona === "elara" ? "/elara-real.png" : "/themba-real.jpg";
            }
            return persona === "elara" ? "/elara-android.png" : "/themba-android.png";
        },
        [persona, useRealImage]
    );

    const altText = persona === "elara"
        ? "Elara — sovereign mother AI tutor"
        : "Themba — architect son AI";

    return (
        <div
            className={clsx(
                "relative inline-grid place-items-center rounded-full",
                "aether-aura",
                `avatar-${persona}`,
                `state-${state}`,
                className
            )}
            style={{ width: size, height: size }}
            role="img"
            aria-label={altText}
        >
            {/* Main Image */}
            <div className="relative w-full h-full rounded-full overflow-hidden z-10">
                <Image
                    src={src}
                    alt={altText}
                    fill
                    className={clsx(
                        "object-cover transition-all duration-500",
                        // Base enhancements for Golden Androids
                        !useRealImage && "brightness-110 saturate-[1.15] contrast-105",
                        // Specific "Beautiful" refinement for Elara: Soften and warm up
                        !useRealImage && persona === "elara" && "brightness-125 saturate-[1.2] sepia-[0.1]"
                    )}
                    priority
                />

                {/* Holographic Overlay (Subtle) */}
                <div className={clsx(
                    "absolute inset-0 mix-blend-overlay opacity-40",
                    persona === "elara" ? "bg-gradient-to-tr from-teal-400/40 via-transparent to-violet-400/40" : // Brighter teal for Elara
                        "bg-gradient-to-tr from-amber-500/30 via-transparent to-violet-500/30"
                )} />

                {/* Beauty Filter for Elara (Soft Glow) */}
                {persona === "elara" && !useRealImage && (
                    <div className="absolute inset-0 bg-white/10 mix-blend-soft-light backdrop-blur-[0.5px]" />
                )}

                {/* Scanline Effect (Very subtle) */}
                <div className="absolute inset-0 bg-[url('/assets/scanlines.png')] opacity-5 pointer-events-none mix-blend-screen" />
            </div>

            {/* Aura Ring */}
            <span className="aura-ring" aria-hidden="true" />

            {/* State indicator */}
            {state !== "idle" && (
                <span className={clsx(
                    "absolute -bottom-1 -right-1 w-3 h-3 rounded-full z-20 border-2 border-background shadow-[0_0_10px_currentColor]",
                    state === "thinking" && "bg-amber-400 animate-pulse shadow-amber-400/50",
                    state === "guiding" && "bg-teal-400 shadow-teal-400/50",
                    state === "verifying" && "bg-emerald-400 shadow-emerald-400/50",
                    state === "reviewing" && "bg-violet-400 shadow-violet-400/50"
                )} />
            )}
        </div>
    );
}

/**
 * Inline avatar badge for use in text or compact spaces
 */
export function AvatarBadge({ persona, state = "idle" }: { persona: Persona; state?: AvatarState }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Avatar persona={persona} size={20} state={state} />
            <span className={clsx(
                "text-xs font-mono capitalize tracking-wide",
                persona === "elara" ? "text-[var(--aether-teal)]" : "text-[var(--aether-gold)]"
            )}>
                {persona}
            </span>
        </span>
    );
}
