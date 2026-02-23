import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

/**
 * Code Execution Endpoint
 * 
 * SECURITY: Requires authentication to execute code
 * Uses Piston API for secure containerized execution
 */

// Language ID mapping for Piston API
const LANGUAGE_MAP: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rust: 'rust',
    ruby: 'ruby',
    php: 'php',
};

/**
 * Execute code in a secure, containerized sandbox using Piston API
 * https://github.com/engineer-man/piston
 * 
 * This replaces the unsafe eval() approach with a production-ready solution.
 * Piston runs code in isolated Docker containers with resource limits.
 */
export async function POST(request: NextRequest) {
    try {
        // SECURITY: Require authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Authentication required to execute code' },
                { status: 401 }
            );
        }

        const { code, language, stdin = '' } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'No code provided' }, { status: 400 });
        }

        const languageId = LANGUAGE_MAP[language?.toLowerCase()] || language;
        
        // Use Piston API for secure code execution
        // Fallback to public instance if PISTON_API_URL is not configured
        const pistonUrl = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

        try {
            const executionResponse = await fetch(`${pistonUrl}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: languageId,
                    version: '*', // Use latest available version
                    files: [
                        {
                            name: `main.${getFileExtension(languageId)}`,
                            content: code,
                        }
                    ],
                    stdin: stdin,
                    args: [],
                    compile_timeout: 10000, // 10 seconds
                    run_timeout: 3000, // 3 seconds
                    compile_memory_limit: -1,
                    run_memory_limit: -1,
                }),
            });

            if (!executionResponse.ok) {
                const error = await executionResponse.text();
                return NextResponse.json(
                    { error: `Execution service error: ${error}` },
                    { status: 500 }
                );
            }

            const result = await executionResponse.json();

            // Format the response
            const output = [
                result.compile?.stdout || '',
                result.compile?.stderr || '',
                result.run?.stdout || '',
                result.run?.stderr || '',
            ].filter(Boolean).join('\n');

            return NextResponse.json({
                output: output || 'No output',
                exitCode: result.run?.code || 0,
                signal: result.run?.signal || null,
                language: result.language,
                version: result.version,
            });

        } catch (execError: any) {
            console.error('Code execution error:', execError);
            return NextResponse.json(
                { 
                    error: 'Failed to execute code in sandbox',
                    details: execError.message,
                    fallback: 'Configure PISTON_API_URL environment variable or deploy a local Piston instance'
                },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Request processing error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
        javascript: 'js',
        typescript: 'ts',
        python: 'py',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        go: 'go',
        rust: 'rs',
        ruby: 'rb',
        php: 'php',
    };
    return extensions[language] || 'txt';
}
