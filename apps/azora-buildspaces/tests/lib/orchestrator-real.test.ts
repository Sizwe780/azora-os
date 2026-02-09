import { describe, it, expect, beforeAll } from '@jest/globals';
import { WorkflowOrchestrator, type Workflow } from '@/lib/agents/orchestrator';
import { NiaAgent } from '@/lib/agents/nia-validator';
import { ThembaAgent } from '@/lib/agents/themba-analyzer';
import { runCommand } from '@/lib/runtime/command-runner';

describe('Orchestrator - Real Implementation Tests', () => {
  let orchestrator: WorkflowOrchestrator;

  beforeAll(() => {
    orchestrator = new WorkflowOrchestrator();
  });

  describe('Command Execution', () => {
    it('should execute JavaScript code', async () => {
      const result = await runCommand({
        type: 'javascript',
        code: 'console.log("Hello, World!"); return "test";',
      });

      expect(result.success).toBe(true);
    });

    it('should handle command errors gracefully', async () => {
      const result = await runCommand({
        type: 'bash',
        command: 'false', // Command that fails
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject unknown command types', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await runCommand({
        type: 'unknown' as any,
        command: 'echo test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown command type');
    });
  });

  describe('Nia Agent - Specification Validation', () => {
    let nia: NiaAgent;

    beforeAll(() => {
      nia = new NiaAgent();
    });

    it('should validate a good specification', async () => {
      const spec = {
        title: 'User Authentication System',
        description: 'A comprehensive authentication system with OAuth support',
        requirements: {
          REQ_001: {
            description: 'Users can register with email and password',
            priority: 'HIGH',
          },
          REQ_002: {
            description: 'Users can log in securely',
            priority: 'HIGH',
          },
        },
        acceptanceCriteria: [
          'Given a new user, when they register, then they can log in',
          'Given a user logs in correctly, then they see the dashboard',
        ],
      };

      const result = await nia.validateSpec(spec);

      expect(result.valid).toBe(true);
      expect(result.completeness).toBeGreaterThan(70);
      expect(result.errors.length).toBe(0);
    });

    it('should reject specifications with TODO/MOCK', async () => {
      const spec = {
        title: 'Incomplete Spec',
        description: 'This is incomplete description',
        requirements: {
          REQ_001: {
            description: 'TODO: Implement this later',
          },
        },
        acceptanceCriteria: [
          'When the system does something, then TODO',
        ],
      };

      const result = await nia.validateSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect missing required fields', async () => {
      const spec = {
        title: 'Incomplete',
        // Missing description, requirements, acceptanceCriteria
      };

      const result = await nia.validateSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'description')).toBe(true);
    });
  });

  describe('Themba Agent - Code Quality Analysis', () => {
    let themba: ThembaAgent;

    beforeAll(() => {
      themba = new ThembaAgent();
    });

    it('should analyze simple code', async () => {
      const code = `
        function add(a, b) {
          return a + b;
        }
        
        const result = add(2, 3);
        console.log(result);
      `;

      const report = await themba.analyzeCode(code);

      expect(report.score).toBeGreaterThan(0);
      expect(report.grade).toBeDefined();
      expect(['A', 'B', 'C', 'D', 'F']).toContain(report.grade);
    });

    it('should detect security issues', async () => {
      const code = `
        const password = "secret123";
        eval(userInput);
      `;

      const report = await themba.analyzeCode(code);

      expect(report.issues.length).toBeGreaterThan(0);
      expect(
        report.issues.some((i) =>
          ['SECURITY_EVAL', 'HARDCODED_SECRET'].includes(i.type)
        )
      ).toBe(true);
    });

    it('should flag high complexity', async () => {
      const code = `
        function complex(x) {
          if (x > 0) {
            if (x > 10) {
              if (x > 100) {
                if (x > 1000) {
                  return "huge";
                }
                return "large";
              }
              return "medium";
            }
            return "small";
          }
          return "zero";
        }
      `;

      const report = await themba.analyzeCode(code);

      expect(report.recommendations.some((r) =>
        r.toLowerCase().includes('complexity')
      )).toBe(true);
    });

    it('should generate improvement suggestions', async () => {
      const code = `
        function bad() {
          if (process.env.API_KEY) {
            fetch(process.env.API_KEY);
          }
        }
      `;

      const report = await themba.analyzeCode(code);
      const suggestions = await themba.suggestImprovements(report);

      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Workflow Execution', () => {
    it('should execute a write_file action', async () => {
      const workflow = {
        id: 'test-workflow-1',
        name: 'Write Test File',
        description: 'Test writing files',
        nodes: [
          {
            id: 'trigger',
            type: 'trigger' as const,
            position: { x: 0, y: 0 },
            data: {
              triggerType: 'manual' as const,
            },
          },
          {
            id: 'action',
            type: 'action' as const,
            position: { x: 100, y: 0 },
            data: {
              actionType: 'write_file' as const,
              config: {
                filePath: '/tmp/test-output.txt',
                content: 'Test content from orchestrator',
              },
            },
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'trigger',
            target: 'action',
          },
        ],
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save the workflow into the orchestrator VFS before executing
      await orchestrator.saveWorkflow(workflow as unknown as Workflow);
      const result = await orchestrator.execute(workflow.id, {});

      expect(result.success).toBe(true);
    });

    it('should reject workflow without trigger node', async () => {
      const workflow = {
        id: 'test-workflow-2',
        name: 'No Trigger',
        description: 'Test missing trigger',
        nodes: [
          {
            id: 'action',
            type: 'action' as const,
            position: { x: 100, y: 0 },
            data: {
              actionType: 'write_file' as const,
              config: {
                filePath: '/tmp/test.txt',
                content: 'test',
              },
            },
          },
        ],
        edges: [],
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save the workflow so orchestrator can find it
      await orchestrator.saveWorkflow(workflow as unknown as Workflow);
      const result = await orchestrator.execute(workflow.id, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('trigger');
    });
  });
});
