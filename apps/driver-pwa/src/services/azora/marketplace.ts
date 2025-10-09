export type MarketplaceItem = {
    id: string;
    name: string;
    cost: number;
    type: 'perk' | 'badge' | 'service';
    description: string;
  };
  
  const items: MarketplaceItem[] = [
    { id: 'priority-proposal', name: 'Priority Proposal Slot', cost: 200, type: 'perk', description: 'Move your proposal to the top of the queue' },
    { id: 'federation-pass', name: 'Federation Council Pass', cost: 500, type: 'perk', description: 'Temporary seat in federation council' },
    { id: 'badge-upgrade', name: 'Badge Upgrade', cost: 100, type: 'badge', description: 'Convert streak into a permanent badge' },
  ];
  
  export function listMarketplaceItems(): MarketplaceItem[] {
    return items;
  }
  
  export function purchaseItem(citizenId: string, itemId: string, repDistribution: Record<string, number>) {
    const item = items.find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');
    const currentRep = repDistribution[citizenId] ?? 0;  // Fixed: safely get current REP or default to 0
    if (currentRep < item.cost) throw new Error('Not enough REP');
    repDistribution[citizenId] = currentRep - item.cost;  // Fixed: update REP safely
    return { success: true, item };
  }