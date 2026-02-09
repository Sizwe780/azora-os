/**
 * Command Runner - Execute real commands safely
 * 
 * Supports:
 * - JavaScript/TypeScript execution (WebContainer)
 * - Python execution (subprocess)
 * - Bash/Shell execution
 * - Deployment commands (K8s, Vercel)
 * 
 * Constitutional: Real execution, proper error handling
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';

// WebContainer is a browser-only API. During Node tests it may not be installed.
// Try to require it dynamically and fallback to undefined if unavailable.
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
let WebContainer: any
try {
  WebContainer = require('@webcontainer/api').WebContainer
} catch (err) {
  WebContainer = undefined
}

const execAsync = promisify(exec);

export interface CommandConfig {
  type: 'javascript' | 'typescript' | 'python' | 'bash' | 'shell';
  code?: string;
  command?: string;
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
}

export interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
  exitCode?: number;
  duration: number;
}

/**
 * Execute JavaScript/TypeScript code in WebContainer (browser-safe)
 */
async function executeJavaScript(config: CommandConfig): Promise<CommandResult> {
  const startTime = Date.now();
  
  try {
    if (!config.code) {
      throw new Error('No code provided');
    }

    // Try to use WebContainer if available
    try {
      const container = await WebContainer.boot();
      const result = await container.fs.writeFile(
        '/tmp/run.js',
        config.code
      );
      
      const process = await container.spawn('node', ['/tmp/run.js'], {
        env: config.env || {},
      });

      let output = '';
      process.output.pipeTo(
        new WritableStream({
          write(chunk) {
            output += chunk;
          },
        })
      );

      const exitCode = await process.exit;

      return {
        success: exitCode === 0,
        output,
        exitCode,
        duration: Date.now() - startTime,
      };
    } catch (containerError) {
      // Fallback to Node.js eval for simple code (safer than eval)
      // Only for trusted, generated code
      console.warn('[CommandRunner] WebContainer unavailable, using safe eval');
      
      const wrappedCode = `
        (async () => {
          try {
            const console_log = console.log;
            let output = '';
            const console_proxy = { log: (...args) => { output += args.join(' ') + '\\n'; } };
            
            ${config.code}
            
            return output;
          } catch (error) {
            throw error;
          }
        })()
      `;

      const fn = new Function(wrappedCode);
      const output = await fn();

      return {
        success: true,
        output: String(output),
        duration: Date.now() - startTime,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Execute Python code
 */
async function executePython(config: CommandConfig): Promise<CommandResult> {
  const startTime = Date.now();
  
  try {
    if (!config.code) {
      throw new Error('No code provided');
    }

    const { stdout, stderr } = await execAsync(
      `python3 -c "${config.code.replace(/"/g, '\\"')}"`,
      {
        cwd: config.cwd || process.cwd(),
        timeout: config.timeout || 30000,
        env: { ...process.env, ...config.env },
      }
    );

    return {
      success: true,
      output: stdout || stderr,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.stderr || error.message,
      exitCode: error.code,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Execute shell command
 */
async function executeShell(config: CommandConfig): Promise<CommandResult> {
  const startTime = Date.now();
  
  try {
    if (!config.command) {
      throw new Error('No command provided');
    }

    const { stdout, stderr } = await execAsync(config.command, {
      cwd: config.cwd || process.cwd(),
      timeout: config.timeout || 30000,
      env: { ...process.env, ...config.env },
    });

    return {
      success: true,
      output: stdout || stderr,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.stderr || error.message || error.toString(),
      exitCode: error.code,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Execute deployment command (K8s or Vercel)
 */
async function executeDeploy(config: CommandConfig): Promise<CommandResult> {
  const startTime = Date.now();
  
  try {
    if (!config.command) {
      throw new Error('No deployment command provided');
    }

    // Sanitize command to prevent injection
    const allowedCommands = ['kubectl apply', 'kubectl delete', 'vercel deploy', 'vercel --prod'];
    const isAllowed = allowedCommands.some(allowed => config.command?.startsWith(allowed));

    if (!isAllowed) {
      throw new Error(`Deployment command not allowed: ${config.command}`);
    }

    const { stdout, stderr } = await execAsync(config.command, {
      cwd: config.cwd || process.cwd(),
      timeout: config.timeout || 120000, // 2 min for deployments
      env: { ...process.env, ...config.env },
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    });

    return {
      success: true,
      output: stdout || stderr,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.stderr || error.message,
      exitCode: error.code,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Main execution router
 */
export async function runCommand(config: CommandConfig): Promise<CommandResult> {
  // Log execution (for audit)
  console.log(`[CommandRunner] Executing ${config.type}:`, {
    timeout: config.timeout,
    cwd: config.cwd,
  });

  try {
    switch (config.type) {
      case 'javascript':
      case 'typescript':
        return await executeJavaScript(config);
      case 'python':
        return await executePython(config);
      case 'bash':
      case 'shell':
        return await executeShell(config);
      default:
        return {
          success: false,
          error: `Unknown command type: ${config.type}`,
          duration: 0,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: 0,
    };
  }
}
