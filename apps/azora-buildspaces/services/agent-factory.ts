import { BuildAgent } from './build-agent';
// @ts-ignore
import { BaseAgent, JabariAgent } from '@azora/shared-ai';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  static getAgent(name: string): BaseAgent {
    if (!this.agents.has(name)) {
      switch (name.toLowerCase()) {
        case 'builder':
        case 'themba':
          this.agents.set(name, new BuildAgent());
          break;
        case 'security':
        case 'jabari':
          this.agents.set(name, new JabariAgent());
          break;
        default:
          this.agents.set(name, new BaseAgent(name, 'Assistant'));
      }
    }
    return this.agents.get(name)!;
  }
}
