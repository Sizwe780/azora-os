import { NextRequest, NextResponse } from 'next/server'

interface CollectibleCard {
    id: string;
    name: string;
    tier: "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythical";
    power: number;
    description: string;
    achievements: string[];
    rarity: number;
    image: string;
    minted: boolean;
    owner: string | null;
}

// Mock data for now - will be replaced with database queries
const mockCards: CollectibleCard[] = [
    {
        id: "1",
        name: "Code Architect",
        tier: "legendary",
        power: 7500,
        description: "Master of full-stack development with 100+ projects completed",
        achievements: ["100 Projects", "Full-Stack Master", "Code Reviewer"],
        rarity: 0.5,
        image: "/elara-avatar.png",
        minted: true,
        owner: "You"
    },
    {
        id: "2",
        name: "AI Pioneer",
        tier: "epic",
        power: 2500,
        description: "Early adopter of Constitutional AI with 50+ AI implementations",
        achievements: ["AI Pioneer", "Constitutional AI", "Agent Trainer"],
        rarity: 2.1,
        image: "/themba-avatar.png",
        minted: true,
        owner: "You"
    },
    {
        id: "3",
        name: "Community Builder",
        tier: "rare",
        power: 800,
        description: "Built bridges between developers and contributed to open source",
        achievements: ["Open Source", "Mentor", "Community Leader"],
        rarity: 8.5,
        image: "/elara-github.png",
        minted: false,
        owner: null
    }
];

export async function GET(request: NextRequest) {
    try {
        // TODO: Replace with actual database query
        return NextResponse.json({
            cards: mockCards,
            total: mockCards.length
        });
    } catch (error) {
        console.error('Failed to fetch collectibles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch collectibles' },
            { status: 500 }
        );
    }
}