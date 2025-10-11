import React, { useEffect, useMemo, useState } from 'react';

interface LeaderboardEntry {
    id: string;
    userId: string | null;
    name: string;
    email: string | null;
    score: number;
    history: Array<{ delta: number; reason?: string; timestamp?: string }>;
}

const LeaderboardWidget: React.FC<{ userId: string }> = ({ userId }) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/reputation/leaderboard');
                if (!response.ok) {
                    throw new Error(`Failed to load leaderboard (${response.status})`);
                }
                const data: LeaderboardEntry[] = await response.json();
                if (isMounted) {
                    setEntries(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Unknown error');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        load();
        const interval = window.setInterval(load, 30000);
        return () => {
            isMounted = false;
            window.clearInterval(interval);
        };
    }, []);

    const highlightedEntries = useMemo(() =>
        entries.map(entry => ({
            ...entry,
            isCurrentUser: entry.userId === userId,
        })),
        [entries, userId]
    );

    return (
        <div className="rounded-xl bg-slate-900/70 border border-white/10 p-6 space-y-4">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-cyan-300">Reputation Leaderboard</h2>
                    <p className="text-xs text-white/60">Top contributors across the federation</p>
                </div>
                <span className="text-xs text-white/50">Updates automatically</span>
            </header>
            {isLoading && <p className="text-sm text-white/60">Loading leaderboard…</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
            {!isLoading && !error && (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-white/60">
                            <th className="py-2 text-left">Rank</th>
                            <th className="py-2 text-left">Name</th>
                            <th className="py-2 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {highlightedEntries.map((entry, index) => (
                            <tr
                                key={entry.id}
                                className={`border-t border-white/10 ${entry.isCurrentUser ? 'bg-cyan-500/10' : ''}`}
                            >
                                <td className="py-2 text-white/70">#{index + 1}</td>
                                <td className="py-2">
                                    <div className="text-white/90 font-semibold">{entry.name}</div>
                                    {entry.email && <div className="text-xs text-white/50">{entry.email}</div>}
                                </td>
                                <td className="py-2 text-right text-white/90 font-bold">{entry.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default LeaderboardWidget;
