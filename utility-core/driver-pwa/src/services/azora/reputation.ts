/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export type Milestone = {
  id: string;
  title: string;
  description?: string;
  timestamp: string; // ISO-8601
  points: number;
};

export async function fetchReputation(): Promise<Milestone[]> {
  const res = await fetch('/api/reputation');
  if (!res.ok) throw new Error(`Reputation fetch failed: ${res.status}`);
  return res.json();
}
