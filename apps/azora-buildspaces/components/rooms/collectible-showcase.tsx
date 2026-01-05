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
    Crown as CrownIcon,
    Infinity,
    Heart
} from "lucide-react";

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
    common: { color: 'bg-gray-500', textColor: 'text-gray-500', icon: Star, range: [0, 99] },
    uncommon: { color: 'bg-green-500', textColor: 'text-green-500', icon: Award, range: [100, 499] },
    rare: { color: 'bg-blue-500', textColor: 'text-blue-500', icon: Medal, range: [500, 999] },
    epic: { color: 'bg-purple-500', textColor: 'text-purple-500', icon: Crown, range: [1000, 4999] },
    legendary: { color: 'bg-orange-500', textColor: 'text-orange-500', icon: Flame, range: [5000, 9999] },
    mythical: { color: 'bg-pink-500', textColor: 'text-pink-500', icon: Infinity, range: [10000, Infinity] }
};

const SAMPLE_CARDS: CollectibleCard[] = [
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
    },
    {
        id: "4",
        name: "Learning Sage",
        tier: "uncommon",
        power: 300,
        description: "Completed 25+ courses and taught others",
        achievements: ["25 Courses", "Teacher", "Knowledge Seeker"],
        rarity: 15.2,
        image: "/themba-github.png",
        minted: true,
        owner: "You"
    }
];

export default function CollectibleShowcase() {
    const [cards, setCards] = useState<CollectibleCard[]>(SAMPLE_CARDS);
    const [selectedCard, setSelectedCard] = useState<CollectibleCard | null>(null);
    const [activeTab, setActiveTab] = useState("gallery");
    
    // Real-time stats (simulated for now but using the formula)
    const [stats, setStats] = useState({
        projects: 12,
        courses: 5,
        specs: 24,
        contributions: 3,
        teachingHours: 10,
        azrEarned: 5000,
        streak: 15
    });

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
    const [totalMinted, setTotalMinted] = useState(3);
    const [leaderboardRank, setLeaderboardRank] = useState(42);

    const mintCard = (cardId: string) => {
        setCards(prev => prev.map(card => 
            card.id === cardId ? { ...card, minted: true, owner: "You" } : card
        ));
        setTotalMinted(prev => prev + 1);
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
                        <TabsList className="grid w-full grid-cols-4 bg-white/10">
                            <TabsTrigger value="gallery" className="data-[state=active]:bg-white/20">
                                <Trophy className="w-4 h-4 mr-2" />
                                Gallery
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full overflow-y-auto">
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

                        <TabsContent value="leaderboard" className="h-full m-0 p-6">
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white mb-4">Global Leaderboard</h2>
                                {[1, 2, 3, 4, 5].map((rank) => (
                                    <Card key={rank} className="bg-white/10 border-white/20">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                                        rank === 1 ? 'bg-yellow-500 text-black' :
                                                        rank === 2 ? 'bg-gray-400 text-black' :
                                                        rank === 3 ? 'bg-orange-600 text-white' :
                                                        'bg-white/20 text-white'
                                                    }`}>
                                                        {rank}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">
                                                            {rank === 1 ? 'CodeMaster' : 
                                                             rank === 2 ? 'AIWizard' :
                                                             rank === 3 ? 'DesignGuru' :
                                                             `Developer${rank}`}
                                                        </div>
                                                        <div className="text-sm text-slate-400">
                                                            {rank === 1 ? '45,230' : 
                                                             rank === 2 ? '38,120' :
                                                             rank === 3 ? '32,890' :
                                                             `${30000 - rank * 1000}`} power
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-slate-400">
                                                    {rank === 1 ? 'Champion' :
                                                     rank === 2 ? 'Master' :
                                                     rank === 3 ? 'Expert' :
                                                     'Contributor'}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="mint" className="h-full m-0 p-6">
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

                        <TabsContent value="achievements" className="h-full m-0 p-6">
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white mb-4">Your Achievements</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { name: "First Project", icon: Target, progress: 100, total: 1 },
                                        { name: "Code Reviews", icon: Users, progress: 75, total: 100 },
                                        { name: "AI Implementations", icon: Sparkles, progress: 50, total: 50 },
                                        { name: "Courses Completed", icon: Award, progress: 25, total: 25 },
                                        { name: "Community Contributions", icon: Heart, progress: 15, total: 20 },
                                        { name: "Days Streak", icon: Flame, progress: 7, total: 30 }
                                    ].map((achievement) => {
                                        const Icon = achievement.icon;
                                        return (
                                            <Card key={achievement.name} className="bg-white/10 border-white/20">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Icon className="w-5 h-5 text-blue-400" />
                                                        <span className="font-medium text-white">{achievement.name}</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-400">
                                                                {achievement.progress} / {achievement.total}
                                                            </span>
                                                            <span className="text-slate-400">
                                                                {Math.round((achievement.progress / achievement.total) * 100)}%
                                                            </span>
                                                        </div>
                                                        <Progress value={(achievement.progress / achievement.total) * 100} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
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
                            <div className="text-center space-y-4">
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
                                        className="w-full bg-purple-600 hover:bg-purple-700"
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
