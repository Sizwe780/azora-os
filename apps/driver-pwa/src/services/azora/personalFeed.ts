export function generateCitizenFeed(citizenId: string, proposals: any[], repDistribution: any, delegations: any[]) {
    const feed: string[] = [];
  
    const rep = repDistribution[citizenId] || 0;
    feed.push(`You currently hold ${rep} REP.`);
  
    const supported = proposals.filter(p => p.supporters?.includes(citizenId));
    supported.forEach(p => {
      feed.push(`Proposal "${p.title}" you supported is now at ${p.totalStaked} REP.`);
    });
  
    const outgoing = delegations.filter(d => d.from === citizenId);
    outgoing.forEach(d => {
      feed.push(`You delegated ${d.amount} REP to ${d.to}.`);
    });
  
    const incoming = delegations.filter(d => d.to === citizenId);
    incoming.forEach(d => {
      feed.push(`${d.from} delegated ${d.amount} REP to you.`);
    });
  
    return feed;
  }