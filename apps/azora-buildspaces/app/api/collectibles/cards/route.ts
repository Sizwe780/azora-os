/**
 * Collectible Cards API
 * 
 * Constitutional Compliance:
 * - Article VIII Section 8.3: No Mock Protocol - Real database queries only
 * - Article III: Economic Constitution - NFT collectibles system
 * - Truth as Currency: Real achievement data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/client'

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

export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized - Please sign in' },
                { status: 401 }
            )
        }

        const userId = session.user.id

        // Fetch user's collectible cards from database
        const cards = await prisma.collectibleCard.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { ownerId: null } // Available cards
                ]
            },
            orderBy: [
                { minted: 'desc' },
                { power: 'desc' }
            ]
        })

        // Transform database records to API format
        const formattedCards: CollectibleCard[] = cards.map((card: any) => ({
            id: card.id,
            name: card.name,
            tier: card.tier as CollectibleCard['tier'],
            power: card.power,
            description: card.description,
            achievements: card.achievements as string[],
            rarity: card.rarity,
            image: card.image,
            minted: card.minted,
            owner: card.ownerId === userId ? 'You' : card.ownerId
        }))

        return NextResponse.json({
            cards: formattedCards,
            total: formattedCards.length,
            minted: formattedCards.filter(c => c.minted).length,
            available: formattedCards.filter(c => !c.minted).length
        })
    } catch (error) {
        console.error('Failed to fetch collectibles:', error)
        return NextResponse.json(
            { 
                error: 'Failed to fetch collectibles',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}