export type CrisisScenario = {
  id: string;
  type: string;
  impact: Record<string, number>;
  response: string;
};

let scenarios: CrisisScenario[] = [];

export function simulateCrisis(type: string, impact: Record<string, number>, response: string) {
  const scenario: CrisisScenario = {
    id: Math.random().toString(36).slice(2),
    type,
    impact,
    response,
  };
  scenarios.push(scenario);
  return scenario;
}

export function listScenarios() {
  return scenarios;
}