import { NextRequest, NextResponse } from 'next/server';
import { VM } from 'vm2'; // We should add this to package.json if possible, but for now we'll use a simpler approach if not available

export async function POST(request: NextRequest) {
    try {
        const { code, language } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'No code provided' }, { status: 400 });
        }

        if (language !== 'javascript' && language !== 'typescript') {
            return NextResponse.json({ 
                error: `Execution for ${language} is not yet supported in this environment. Please use JavaScript or TypeScript.` 
            }, { status: 400 });
        }

        // Simple execution logic for demonstration
        // In a real production system, this would run in a Docker container or a secure gVisor sandbox
        let output = '';
        const consoleLog = (...args: any[]) => {
            output += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\n';
        };

        try {
            // Basic isolation using a function constructor
            // NOTE: This is still not perfectly secure, but better than raw eval()
            const sandbox = { console: { log: consoleLog }, process: {}, env: {} };
            const fn = new Function('console', 'process', 'env', `
                try {
                    ${code}
                } catch (e) {
                    console.log('Runtime Error: ' + e.message);
                }
            `);
            
            fn(sandbox.console, sandbox.process, sandbox.env);

            return NextResponse.json({ output });
        } catch (execError: any) {
            return NextResponse.json({ error: execError.message }, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
