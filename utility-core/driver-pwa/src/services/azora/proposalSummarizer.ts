export function summarizeProposal(title: string, description: string): string {
    return description.length > 120
      ? description.slice(0, 120) + '…'
      : description;
  }