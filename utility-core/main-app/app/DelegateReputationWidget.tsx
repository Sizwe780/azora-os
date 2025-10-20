import React, { useEffect, useMemo, useState } from 'react';

interface DelegateReputation {
	id: string;
	userId: string | null;
	score: number;
	recentActivity: Array<{ delta: number; reason?: string; timestamp?: string }>;
}

const DelegateReputationWidget: React.FC<{ userId: string }> = ({ userId }) => {
	const [delegates, setDelegates] = useState<DelegateReputation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch(`/api/reputation/delegates/${encodeURIComponent(userId)}`);
				if (!response.ok) {
					throw new Error(`Failed to load delegate reputation (${response.status})`);
				}
				const data: DelegateReputation[] = await response.json();
				if (isMounted) {
					setDelegates(data);
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
	}, [userId]);

	const topDelegates = useMemo(
		() => delegates.sort((a, b) => b.score - a.score).slice(0, 5),
		[delegates]
	);

	return (
		<div className="rounded-xl bg-slate-900/70 border border-white/10 p-6 space-y-4">
			<header>
				<h2 className="text-lg font-bold text-cyan-300">Delegate Reputation</h2>
				<p className="text-xs text-white/60">Real-time view of delegates supporting user {userId}</p>
			</header>
			{isLoading && <p className="text-sm text-white/60">Loading delegate reputation…</p>}
			{error && <p className="text-sm text-red-400">{error}</p>}
			{!isLoading && !error && topDelegates.length === 0 && (
				<p className="text-sm text-white/60">No delegate reputation activity recorded yet.</p>
			)}
			<ul className="space-y-3">
				{topDelegates.map(delegate => (
					<li key={delegate.id} className="rounded-lg bg-white/5 p-4 border border-cyan-500/20">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-semibold text-white/90">Delegate {delegate.userId ?? delegate.id}</p>
								<p className="text-xs text-white/60">Score: {delegate.score}</p>
							</div>
							<span className="text-sm font-bold text-cyan-300">{delegate.score}</span>
						</div>
						{delegate.recentActivity.length > 0 && (
							<ul className="mt-2 space-y-1 text-xs text-white/60">
								{delegate.recentActivity.map((activity, index) => (
									<li key={index}>
										<span className="font-semibold text-cyan-200">{activity.delta >= 0 ? '+' : ''}{activity.delta}</span>
										{activity.reason ? ` • ${activity.reason}` : ''}
										{activity.timestamp ? ` • ${new Date(activity.timestamp).toLocaleString()}` : ''}
									</li>
								))}
							</ul>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export default DelegateReputationWidget;
