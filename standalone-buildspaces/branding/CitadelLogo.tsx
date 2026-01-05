"use client";

import clsx from "clsx";
import { useEffect, useState, useRef } from "react";

interface CitadelLogoProps {
    size?: number | "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeMap = {
    sm: 40,
    md: 80,
    lg: 120,
    xl: 200,
};

/**
 * Citadel BuildSpaces Logo — Fluid Aether Edition
 * Smooth curves, infinite flowing aura, pulsating background
 */
export function CitadelLogo({ size = "md", className }: CitadelLogoProps) {
    const numericSize = typeof size === "number" ? size : sizeMap[size];
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <div
            className={clsx("citadel-logo-container", className)}
            style={{ width: numericSize, height: numericSize }}
            role="img"
            aria-label="Citadel BuildSpaces"
        >
            <svg
                viewBox="0 0 200 200"
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                style={{ overflow: "visible" }}
            >
                <defs>
                    {/* Flowing Gradient - Animated */}
                    <linearGradient id="flowingAura" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#21d4b3">
                            {mounted && (
                                <animate
                                    attributeName="stop-color"
                                    values="#21d4b3;#8a66ff;#f5c349;#21d4b3"
                                    dur="4s"
                                    repeatCount="indefinite"
                                />
                            )}
                        </stop>
                        <stop offset="50%" stopColor="#8a66ff">
                            {mounted && (
                                <animate
                                    attributeName="stop-color"
                                    values="#8a66ff;#f5c349;#21d4b3;#8a66ff"
                                    dur="4s"
                                    repeatCount="indefinite"
                                />
                            )}
                        </stop>
                        <stop offset="100%" stopColor="#f5c349">
                            {mounted && (
                                <animate
                                    attributeName="stop-color"
                                    values="#f5c349;#21d4b3;#8a66ff;#f5c349"
                                    dur="4s"
                                    repeatCount="indefinite"
                                />
                            )}
                        </stop>
                    </linearGradient>

                    {/* Pulsating Glow Filter */}
                    <filter id="auraGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur">
                            {mounted && (
                                <animate
                                    attributeName="stdDeviation"
                                    values="6;12;6"
                                    dur="3s"
                                    repeatCount="indefinite"
                                />
                            )}
                        </feGaussianBlur>
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Subtle Text Glow */}
                    <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur">
                            {mounted && (
                                <animate
                                    attributeName="stdDeviation"
                                    values="2;5;2"
                                    dur="2s"
                                    repeatCount="indefinite"
                                />
                            )}
                        </feGaussianBlur>
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background Pulsating "AETHER AURA" Text */}
                <text
                    x="100"
                    y="170"
                    textAnchor="middle"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontSize="14"
                    fontWeight="500"
                    letterSpacing="0.35em"
                    fill="#8a66ff"
                    filter="url(#textGlow)"
                    style={{ textTransform: "uppercase" }}
                >
                    {mounted && (
                        <animate
                            attributeName="opacity"
                            values="0.1;0.25;0.1"
                            dur="3s"
                            repeatCount="indefinite"
                        />
                    )}
                    AETHER AURA
                </text>

                {/* Outer Aura Ring - Infinite Flow */}
                <circle
                    cx="100"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="url(#flowingAura)"
                    strokeWidth="1"
                    opacity="0.3"
                    filter="url(#auraGlow)"
                />

                {/* Flowing Infinity Symbol - Smooth Bezier Curves */}
                <path
                    d="M 60 90 
             C 60 60, 30 50, 30 90 
             C 30 130, 60 120, 100 90 
             C 140 60, 170 50, 170 90 
             C 170 130, 140 120, 100 90"
                    fill="none"
                    stroke="url(#flowingAura)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#auraGlow)"
                >
                    {/* Dash Animation for Flowing Effect */}
                    {mounted && (
                        <>
                            <animate
                                attributeName="stroke-dasharray"
                                values="0 500;250 250;500 0;250 250;0 500"
                                dur="6s"
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="stroke-dashoffset"
                                values="0;-500"
                                dur="3s"
                                repeatCount="indefinite"
                            />
                        </>
                    )}
                </path>

                {/* A - Left Anchor (Fluid) */}
                <text
                    x="45"
                    y="100"
                    textAnchor="middle"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontSize="28"
                    fontWeight="700"
                    fill="url(#flowingAura)"
                    filter="url(#auraGlow)"
                >
                    A
                </text>

                {/* Z - Right Anchor (Fluid) */}
                <text
                    x="155"
                    y="100"
                    textAnchor="middle"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontSize="28"
                    fontWeight="700"
                    fill="url(#flowingAura)"
                    filter="url(#auraGlow)"
                >
                    Z
                </text>

                {/* Center Pulse Point */}
                <circle cx="100" cy="90" r="4" fill="white" opacity="0.9">
                    {mounted && (
                        <animate
                            attributeName="r"
                            values="3;6;3"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    )}
                    {mounted && (
                        <animate
                            attributeName="opacity"
                            values="0.9;0.5;0.9"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    )}
                </circle>
            </svg>
        </div>
    );
}

/**
 * Navigation Logo with Text
 */
export function CitadelLogoNav() {
    return (
        <div className="flex items-center gap-3">
            <CitadelLogo size="sm" />
            <div className="flex flex-col leading-none">
                <span className="text-base font-semibold tracking-tight bg-gradient-to-r from-[#21d4b3] via-[#8a66ff] to-[#f5c349] bg-clip-text text-transparent">
                    BuildSpaces
                </span>
                <span className="text-[10px] text-[#5c6370] tracking-[0.15em] uppercase">
                    by Azora
                </span>
            </div>
        </div>
    );
}

/**
 * Large Hero Logo with Ambient Effects
 */
export function CitadelLogoHero() {
    return (
        <div className="relative">
            <CitadelLogo size="xl" />
            <div className="absolute inset-0 bg-gradient-radial from-[#8a66ff]/10 via-transparent to-transparent animate-pulse"
                style={{ animationDuration: '4s' }} />
        </div>
    );
}
