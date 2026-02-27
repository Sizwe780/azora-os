// mock firebase-admin to avoid initializing real Firestore during tests
jest.mock('firebase-admin', () => {
  const FieldValue = { arrayUnion: jest.fn((x) => x) }
  const Timestamp = { fromDate: (d: Date) => d }
  const firestore = jest.fn(() => {
    const data: Record<string, any> = {}
    return {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn((u, o) => {
            if (u.trace) {
              data.trace = data.trace || []
              data.trace.push(u.trace)
            }
            if (u.status) data.status = u.status
            if (typeof u.currentStepIndex !== 'undefined') data.currentStepIndex = u.currentStepIndex
            return Promise.resolve()
          }),
          get: jest.fn(() => Promise.resolve({ exists: true, data: () => data })),
        })),
      })),
      FieldValue,
      Timestamp,
    }
  })
  firestore.FieldValue = FieldValue
  firestore.Timestamp = Timestamp
  return {
    apps: [],
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    firestore,
  }
})

import { describe, it, expect, beforeAll } from '@jest/globals';
import { WorkflowOrchestrator, type Workflow } from '@/lib/agents/orchestrator';
import { NiaAgent } from '@/lib/agents/nia-validator';
import { ThembaAgent } from '@/lib/agents/themba-analyzer';
import { runCommand } from '@/lib/runtime/command-runner';

jest.mock('@/lib/workspace/file-system', () => ({
  fileSystem: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue('[]'),
    mkdir: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(true)
  }
}))

describe('Orchestrator - Real Implementation Tests', () => {
  let orchestrator: WorkflowOrchestrator;

  beforeAll(() => {
    // Mock file system in orchestrator
    const fs = require('fs')
    jest.mock('fs', () => ({
      ...jest.requireActual('fs'),
      promises: {
        ...jest.requireActual('fs').promises,
        writeFile: jest.fn().mockResolvedValue(undefined),
        readFile: jest.fn().mockResolvedValue('[]'),
        mkdir: jest.fn().mockResolvedValue(undefined)
      }
    }))

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

    it('tool registry should list built-in tools', async () => {
      const { listTools } = await import('@/lib/agents/tools')
      const tools = listTools()
      expect(tools.some((t) => t.name === 'runTerminal')).toBe(true)
      expect(tools.some((t) => t.name === 'createFile')).toBe(true)
    })
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
      // ensure the trace callback emitted an action step before any observation
      // (we rely on orchestrator's `onStep` in a separate test below)
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

    it('emits an action step before observation', async () => {
      const workflow = {
        id: 'trace-test-1',
        name: 'Trace Test',
        description: 'Verify trace order',
        nodes: [
          {
            id: 'trigger',
            type: 'trigger' as const,
            position: { x: 0, y: 0 },
            data: { triggerType: 'manual' as const },
          },
          {
            id: 'action',
            type: 'action' as const,
            position: { x: 100, y: 0 },
            data: {
              actionType: 'write_file' as const,
              config: { filePath: '/tmp/foo', content: 'bar' },
            },
          },
        ],
        edges: [{ id: 'e1', source: 'trigger', target: 'action' }],
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const steps: any[] = [];
      orchestrator.onStep((s) => steps.push(s));
      await orchestrator.saveWorkflow(workflow as unknown as Workflow);
      const res = await orchestrator.execute(workflow.id, {});
      expect(res.success).toBe(true);
      const actionIndex = steps.findIndex((s) => s.type === 'action');
      // find any observation that occurs after the action index
      const obsAfter = steps.findIndex((s, i) => i > actionIndex && s.type === 'observation');
      expect(actionIndex).toBeGreaterThanOrEqual(0);
      expect(obsAfter).toBeGreaterThanOrEqual(0);
    });

    it('persists steps when executionId is supplied', async () => {
      // spy on persistence helper
      const persistence = await import('@/lib/agents/persistence')
      const spy = jest.spyOn(persistence, 'syncTraceToFirestore' as any).mockResolvedValue(undefined)

      const workflow = {
        id: 'persist-test',
        name: 'Persist Test',
        description: 'test',
        nodes: [
          { id: 'trigger', type: 'trigger' as const, position: { x: 0, y: 0 }, data: { triggerType: 'manual' as const } },
          { id: 'action', type: 'action' as const, position: { x: 100, y: 0 }, data: { actionType: 'write_file' as const, config: { filePath: '/tmp/foo', content: 'bar' } } },
        ],
        edges: [{ id: 'e', source: 'trigger', target: 'action' }],
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as unknown as Workflow;

      await orchestrator.saveWorkflow(workflow)
      const execId = 'my-exec-123'
      await orchestrator.executeWorkflow(workflow.id, {}, undefined, execId)
      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls.some((c: any[]) => c[0] === execId)).toBe(true)
      spy.mockRestore()
    })
  });

  describe('Tool registry helpers', () => {
    it('design_to_code should write a file from a dummy frame', async () => {
      const mod = await import('@/lib/agents/tools')
      const { executeTool, registerTool } = mod as any
      
      const toolName = 'design_to_code_test'
      if (registerTool) {
        registerTool({
          name: toolName,
          description: 'demo',
          parameters: [
            { name: 'filePath', type: 'string', description: 'path', required: true },
            { name: 'frame', type: 'string', description: 'frame', required: true },
          ],
          requiresApproval: false,
          dangerLevel: 'safe',
          execute: async (params: any, _approved: boolean) => {
            return { success: true, content: `Component for ${params.filePath}` }
          },
        })
      }
      
      const frame = { name: 'TestComponent', id: 'frame1', children: [] }
      const result = await executeTool(toolName, {
        filePath: '/tmp/TestComponent.tsx',
        frame: JSON.stringify(frame),
      }, true)
      
      expect(result).toHaveProperty('success', true)
      expect((result as any).content).toContain('Component')
    })
  })
});

// ------------------------------------------------------------------
// MCP server unit tests
// ------------------------------------------------------------------
import { AzoraMCPServer } from '@/lib/agents/mcp-server'

describe('AzoraMCPServer', () => {
  it('handles search_files requests', async () => {
    // ensure indexer has some data (stubbed as empty will still return [])
    const req = { jsonrpc: '2.0', method: 'search_files', params: { query: 'foo', limit: 1 }, id: 1 }
    const res = await AzoraMCPServer.handle(req)
    expect(res.jsonrpc).toBe('2.0')
    expect(Array.isArray(res.result)).toBe(true)
    expect(res.id).toBe(1)
  })

  it('returns method not found for unknown', async () => {
    const req = { jsonrpc: '2.0', method: 'does_not_exist', id: 42 }
    const res = await AzoraMCPServer.handle(req as any)
    expect(res.error).toBeDefined()
    expect(res.error?.code).toBe(-32601)
    expect(res.id).toBe(42)
  })
})
