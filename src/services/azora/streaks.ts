export function calculateStreak(actions: { date: string }[]): number {
    const today = new Date().toDateString();
    let streak = 0;
    for (const action of actions) {
      const d = new Date(action.date).toDateString();
      if (d === today || d === new Date(Date.now() - (streak + 1) * 86400000).toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }