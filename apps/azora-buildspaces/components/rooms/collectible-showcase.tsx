"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Trophy,
    Star,
    Crown,
    Zap,
    Users,
    Share2,
    Download,
    Upload,
    Gift,
    Target,
    Award,
    TrendingUp,
    Sparkles,
    Medal,
    Flame,
    Gem,
    Shield,
    Infinity,
    Heart,
    Lock,
    CheckCircle2
} from "lucide-react";
import { useRoomEvents } from "@/lib/hooks/use-room-events";

interface Achievement {
    id: string;
    name: string;
    description: string;
    room: string;
    power: number;
    tier: keyof typeof RARITY_CONFIG;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
}

interface CollectibleCard {
    id: string;
    name: string;
    tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
    power: number;
    description: string;
    achievements: string[];
    rarity: number; // percentage
    image: string;
    minted: boolean;
    owner: string;
}

const RARITY_CONFIG = {
    common: { color: 'bg-gray-500', textColor: 'text-gray-500', icon: Star, range: [0, 99] as [number, number] },
    uncommon: { color: 'bg-green-500', textColor: 'text-green-500', icon: Award, range: [100, 499] as [number, number] },
    rare: { color: 'bg-blue-500', textColor: 'text-blue-500', icon: Medal, range: [500, 999] as [number, number] },
    epic: { color: 'bg-purple-500', textColor: 'text-purple-500', icon: Crown, range: [1000, 4999] as [number, number] },
    legendary: { color: 'bg-orange-500', textColor: 'text-orange-500', icon: Flame, range: [5000, 9999] as [number, number] },
    mythical: { color: 'bg-pink-500', textColor: 'text-pink-500', icon: Infinity, range: [10000, Number.POSITIVE_INFINITY] as [number, number] }
};

export default function CollectibleShowcase() {
    const { emit, ROOM_EVENTS } = useRoomEvents('collectible-showcase');
    const [cards, setCards] = useState<CollectibleCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<CollectibleCard | null>(null);
    const [activeTab, setActiveTab] = useState("gallery");
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([]);
    const [showUnlockBanner, setShowUnlockBanner] = useState(false);

    // Fetch achievement progress
    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const resp = await fetch('/api/collectibles/achievements');
                if (resp.ok) {
                    const data = await resp.json();
                    setAchievements(data.progress || []);
                }
            } catch { /* silent */ }
        };
        fetchAchievements();
        // Poll for new achievements every 30 seconds
        const interval = setInterval(fetchAchievements, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await fetch('/api/collectibles/cards');
                if (response.ok) {
                    const data = await response.json();
                    setCards(data.cards || []);
                }
            } catch (error) {
                console.error('Error fetching cards:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCards();
    }, []);

    // Group achievements by room
    const achievementsByRoom = achievements.reduce((acc, a) => {
        const room = a.room || 'cross-room';
        if (!acc[room]) acc[room] = [];
        acc[room].push(a);
        return acc;
    }, {} as Record<string, Achievement[]>);

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalAchievementPower = achievements.filter(a => a.unlocked).reduce((s, a) => s + a.power, 0);

    const [stats, setStats] = useState({
        projects: 0,
        courses: 0,
        specs: 0,
        contributions: 0,
        teachingHours: 0,
        azrEarned: 0,
        streak: 0
    });

    const [leaderboard, setLeaderboard] = useState<{ rank: number; name: string; power: number; badge: string }[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const resp = await fetch('/api/collectibles/stats');
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.stats) setStats(data.stats);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const resp = await fetch('/api/collectibles/leaderboard');
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.entries) setLeaderboard(data.entries);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            }
        };
        fetchLeaderboard();
    }, []);

    const calculatePowerScore = () => {
        const { projects, courses, specs, contributions, teachingHours, azrEarned, streak } = stats;
        return (projects * 100) +
            (courses * 50) +
            (specs * 25) +
            (contributions * 200) +
            (teachingHours * 10) +
            (azrEarned / 10) +
            streak;
    };

    const powerScore = calculatePowerScore();
    const [totalMinted, setTotalMinted] = useState(0);
    const [leaderboardRank, setLeaderboardRank] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const resp = await fetch('/api/collectibles/profile');
                if (resp.ok) {
                    const data = await resp.json();
                    setTotalMinted(data.totalMinted ?? 0);
                    setLeaderboardRank(data.rank ?? 0);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };
        fetchProfile();
    }, []);

    const mintCard = async (cardId: string) => {
        try {
            const response = await fetch('/api/web3/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardId, userId: "did:key:z6MkpTHR8V369" })
            });

            if (!response.ok) throw new Error(await response.text());
            const result = await response.json();

            setCards(prev => prev.map(card =>
                card.id === cardId ? { ...card, minted: true, owner: "You" } : card
            ));
            setTotalMinted(prev => prev + 1);

            console.log("Minted successfully:", result.transactionHash);
        } catch (error) {
            console.error("Minting failed:", error);
        }
    };

    const getTierFromPower = (power: number): keyof typeof RARITY_CONFIG => {
        for (const [tier, config] of Object.entries(RARITY_CONFIG)) {
            if (power >= config.range[0] && power <= config.range[1]) {
                return tier as keyof typeof RARITY_CONFIG;
            }
        }
        return 'common';
    };

    const getNextTierProgress = () => {
        const currentPower = powerScore;
        const nextTier = getTierFromPower(currentPower + 1);
        const nextConfig = RARITY_CONFIG[nextTier];
        return {
            current: currentPower,
            next: nextConfig.range[1],
            percentage: (currentPower / nextConfig.range[1]) * 100
        };
    };

    const progress = getNextTierProgress();

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        Collectible Showcase
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                            #{leaderboardRank}
                        </Badge>
                    </h1>
                    <p className="text-slate-400">Community achievements and collectible cards</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm text-slate-400">Power Score</div>
                        <div className="text-xl font-bold text-white">{powerScore.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-400">Cards Minted</div>
                        <div className="text-xl font-bold text-white">{totalMinted}</div>
                    </div>
                </div>
            </div>

            {/* Power Progress */}
            <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Progress to Next Tier</span>
                    <span className="text-sm text-white">{progress.current} / {progress.next}</span>
                </div>
                <Progress value={progress.percentage} className="h-2" />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <div className="px-6 pt-4">
                        <TabsList className="grid w-full grid-cols-5 bg-white/10">
                            <TabsTrigger value="gallery" className="data-[state=active]:bg-white/20">
                                <Trophy className="w-4 h-4 mr-2" />
                                Gallery
                            </TabsTrigger>
                            <TabsTrigger value="achievements" className="data-[state=active]:bg-white/20">
                                <Award className="w-4 h-4 mr-2" />
                                Achievements
                                {unlockedCount > 0 && (
                                    <Badge className="ml-1.5 h-4 px-1 text-[9px] bg-emerald-500">{unlockedCount}</Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-white/20">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Leaderboard
                            </TabsTrigger>
                            <TabsTrigger value="mint" className="data-[state=active]:bg-white/20">
                                <Gem className="w-4 h-4 mr-2" />
                                Mint
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="data-[state=active]:bg-white/20">
                                <Zap className="w-4 h-4 mr-2" />
                                Power Stats
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {/* Achievements Tab */}
                        <TabsContent value="achievements" className="h-full m-0 p-6 overflow-y-auto">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">Achievements</h2>
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-emerald-500/20 text-emerald-400">
                                            {unlockedCount} / {achievements.length} Unlocked
                                        </Badge>
                                        <Badge className="bg-yellow-500/20 text-yellow-400">
                                            {totalAchievementPower.toLocaleString()} Power
                                        </Badge>
                                    </div>
                                </div>

                                {Object.entries(achievementsByRoom).map(([room, roomAchievements]) => (
                                    <div key={room}>
                                        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            {room.replace(/-/g, ' ')}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {roomAchievements.map((achievement) => {
                                                const tierConfig = RARITY_CONFIG[achievement.tier] || RARITY_CONFIG.common;
                                                return (
                                                    <motion.div
                                                        key={achievement.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        className={`rounded-lg border p-4 transition-all ${
                                                            achievement.unlocked
                                                                ? `bg-gradient-to-br ${tierConfig.color}/10 border-${tierConfig.color}/50`
                                                                : 'bg-white/5 border-white/10 opacity-60'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="text-2xl">{achievement.icon}</div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold text-white text-sm">{achievement.name}</h4>
                                                                    {achievement.unlocked ? (
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                                    ) : (
                                                                        <Lock className="w-3 h-3 text-zinc-600" />
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-400 mt-0.5">{achievement.description}</p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <Badge variant="outline" className={`text-[9px] ${tierConfig.textColor}`}>
                                                                        {achievement.tier.toUpperCase()}
                                                                    </Badge>
                                                                    <span className="text-[10px] text-yellow-400">+{achievement.power} power</span>
                                                                    {achievement.unlockedAt && (
                                                                        <span className="text-[10px] text-zinc-500">
                                                                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {achievements.length === 0 && (
                                    <div className="text-center py-12">
                                        <Award className="w-12 h-12 text-white/20 mx-auto mb-3" />
                                        <p className="text-slate-400">Start using rooms to unlock achievements!</p>
                                        <p className="text-xs text-slate-500 mt-1">Every action across all 12 rooms earns achievement progress</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="stats" className="h-full m-0 p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-white/5 border-white/10 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-yellow-400" />
                                            Power Calculation
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Projects Completed ({stats.projects} × 100)</span>
                                            <span className="font-mono text-green-400">+{stats.projects * 100}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Courses Certified ({stats.courses} × 50)</span>
                                            <span className="font-mono text-green-400">+{stats.courses * 50}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Specs Written ({stats.specs} × 25)</span>
                                            <span className="font-mono text-green-400">+{stats.specs * 25}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Community Contributions ({stats.contributions} × 200)</span>
                                            <span className="font-mono text-green-400">+{stats.contributions * 200}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Teaching Hours ({stats.teachingHours} × 10)</span>
                                            <span className="font-mono text-green-400">+{stats.teachingHours * 10}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">AZR Earned ({stats.azrEarned} / 10)</span>
                                            <span className="font-mono text-green-400">+{stats.azrEarned / 10}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Daily Streak ({stats.streak} × 1)</span>
                                            <span className="font-mono text-green-400">+{stats.streak}</span>
                                        </div>
                                        <div className="pt-4 border-t border-white/10 flex justify-between items-center font-bold text-xl">
                                            <span>Total Power Score</span>
                                            <span className="text-yellow-400">{powerScore.toLocaleString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/5 border-white/10 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Target className="w-5 h-5 text-blue-400" />
                                            Next Milestones
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Complete 3 more projects</span>
                                                <span className="text-slate-400">75%</span>
                                            </div>
                                            <Progress value={75} className="h-1.5" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Write 10 more specs</span>
                                                <span className="text-slate-400">40%</span>
                                            </div>
                                            <Progress value={40} className="h-1.5" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Earn 1000 more AZR</span>
                                                <span className="text-slate-400">90%</span>
                                            </div>
                                            <Progress value={90} className="h-1.5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="gallery" className="h-full m-0 p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {cards.map((card) => {
                                    const tierConfig = RARITY_CONFIG[card.tier];
                                    const TierIcon = tierConfig.icon;

                                    return (
                                        <motion.div
                                            key={card.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="cursor-pointer"
                                            onClick={() => setSelectedCard(card)}
                                        >
                                            <Card className={`bg-gradient-to-br ${tierConfig.color}/20 border-2 ${tierConfig.color} hover:shadow-lg transition-all`}>
                                                <CardContent className="p-4">
                                                    <div className="aspect-[5/7] bg-white/10 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                                                        <TierIcon className={`w-16 h-16 ${tierConfig.textColor}`} />
                                                        {card.minted && (
                                                            <Badge className="absolute top-2 right-2 bg-green-500">
                                                                Minted
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="font-bold text-white">{card.name}</h3>
                                                        <div className="flex items-center justify-between">
                                                            <Badge variant="outline" className={tierConfig.textColor}>
                                                                {card.tier.toUpperCase()}
                                                            </Badge>
                                                            <span className="text-sm text-slate-400">
                                                                {card.power.toLocaleString()} power
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 line-clamp-2">
                                                            {card.description}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        <TabsContent value="leaderboard" className="h-full m-0 p-6 overflow-y-auto">
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white mb-4">Global Leaderboard</h2>
                                {leaderboard.length === 0 ? (
                                    <div className="text-center py-12">
                                        <TrendingUp className="w-10 h-10 text-white/20 mx-auto mb-3" />
                                        <p className="text-slate-500 text-sm">Loading leaderboard…</p>
                                    </div>
                                ) : (
                                    leaderboard.map((entry) => (
                                        <Card key={entry.rank} className="bg-white/10 border-white/20">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${entry.rank === 1 ? 'bg-yellow-500 text-black' :
                                                            entry.rank === 2 ? 'bg-gray-400 text-black' :
                                                                entry.rank === 3 ? 'bg-orange-600 text-white' :
                                                                    'bg-white/20 text-white'
                                                            }`}>
                                                            {entry.rank}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">{entry.name}</div>
                                                            <div className="text-sm text-slate-400">
                                                                {entry.power.toLocaleString()} power
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="text-slate-400">
                                                        {entry.badge}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="mint" className="h-full m-0 p-6 overflow-y-auto">
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white mb-4">Mint New Card</h2>
                                <Card className="bg-white/10 border-white/20">
                                    <CardContent className="p-6">
                                        <div className="text-center space-y-4">
                                            <Gem className="w-16 h-16 text-purple-400 mx-auto" />
                                            <h3 className="text-lg font-bold text-white">Mint Achievement Card</h3>
                                            <p className="text-slate-400">
                                                Transform your achievements into collectible NFT cards
                                            </p>
                                            <Button className="bg-purple-600 hover:bg-purple-700">
                                                <Gem className="w-4 h-4 mr-2" />
                                                Mint Card (2 AZR)
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Card Detail Modal */}
            <AnimatePresence>
                {selectedCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedCard(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white rounded-lg p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center space-y-4 text-slate-900">
                                <div className="aspect-[5/7] bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Trophy className="w-24 h-24 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold">{selectedCard.name}</h3>
                                <p className="text-slate-600">{selectedCard.description}</p>
                                <div className="flex justify-center gap-2">
                                    {selectedCard.achievements.map((achievement) => (
                                        <Badge key={achievement} variant="outline">
                                            {achievement}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">
                                        Rarity: {selectedCard.rarity}%
                                    </span>
                                    <span className="font-bold">
                                        {selectedCard.power.toLocaleString()} power
                                    </span>
                                </div>
                                {!selectedCard.minted && (
                                    <Button
                                        onClick={() => mintCard(selectedCard.id)}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        <Gem className="w-4 h-4 mr-2" />
                                        Mint Card
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
