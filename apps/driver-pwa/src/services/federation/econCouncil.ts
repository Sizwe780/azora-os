export type CouncilMember = { id: string; name: string; reputation: number };
export type AdvisoryProposal = { id: string; title: string; content: string; votes: number };

let members: CouncilMember[] = [];
let proposals: AdvisoryProposal[] = [];

export function nominateMember(name: string, reputation: number) {
  const member: CouncilMember = { id: Math.random().toString(36).slice(2), name, reputation };
  members.push(member);
  return member;
}

export function submitProposal(title: string, content: string) {
  const proposal: AdvisoryProposal = { id: Math.random().toString(36).slice(2), title, content, votes: 0 };
  proposals.push(proposal);
  return proposal;
}

export function voteOnProposal(id: string) {
  const p = proposals.find(p => p.id === id);
  if (p) p.votes++;
  return p;
}

export function listProposals() {
  return proposals;
}