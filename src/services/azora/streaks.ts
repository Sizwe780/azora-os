export function calculateStreak(actions: { date: string }[]): number {
    const today = new Date().toDateString();
    let streak = 0;
    for (let i = 0; i < actions.length; i++) {
      const d = new Date(actions[i].date).toDateString();
      if (d === today || d === new Date(Date.now() - (streak+1)*86400000).toDateString()) {
        streak++;
      } else break;
    }
    return streak;
  }