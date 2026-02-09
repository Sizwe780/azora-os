import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
        // SECURITY: Require authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const targetPath = searchParams.get('path');

    if (!targetPath) {
        return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Security: Ensure path is within allowed directory
    // For now, we'll allow any path for audit purposes, but in production this must be restricted
    const absolutePath = path.resolve(targetPath);

    try {
        if (operation === 'list') {
            const entries = await fs.readdir(absolutePath, { withFileTypes: true });
            const result = await Promise.all(entries.map(async (entry) => {
                const entryPath = path.join(absolutePath, entry.name);
                const stats = await fs.stat(entryPath);
                return {
                    name: entry.name,
                    path: entryPath,
                    type: entry.isDirectory() ? 'directory' : 'file',
                    size: stats.size,
                    modified: stats.mtime,
                    isHidden: entry.name.startsWith('.')
                };
            }));
            return NextResponse.json(result);
        } else if (operation === 'read') {
            const content = await fs.readFile(absolutePath, 'utf-8');
            return NextResponse.json({ content });
        } else if (operation === 'gitStatus') {
            try {
                const { stdout } = await execAsync('git status --porcelain', { cwd: absolutePath });
                const { stdout: branchOut } = await execAsync('git branch --show-current', { cwd: absolutePath });
                return NextResponse.json({ status: stdout, branch: branchOut.trim() });
            } catch (e: any) {
                return NextResponse.json({ error: 'Not a git repository or git not installed' }, { status: 500 });
            }
        } else if (operation === 'gitLog') {
            const limitParam = searchParams.get('limit') || '50'
            const limit = parseInt(limitParam, 10) || 50
            try {
                const { stdout } = await execAsync(`git log -n ${limit} --pretty=format:%H|%an|%ae|%ad|%s`, { cwd: absolutePath })
                const lines = stdout.split('\n').filter(Boolean)
                const commits = lines.map(line => {
                    const [hash, author, email, date, ...messageParts] = line.split('|')
                    return {
                        hash,
                        author,
                        email,
                        date,
                        message: messageParts.join('|')
                    }
                })
                return NextResponse.json({ commits })
            } catch (e: any) {
                return NextResponse.json({ error: 'Failed to fetch git log' }, { status: 500 })
            }
        }
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
        // SECURITY: Require authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
    try {
        const { operation, path: targetPath, content, oldPath, newPath } = await request.json();

        if (!targetPath && !oldPath) {
            return NextResponse.json({ error: 'Path is required' }, { status: 400 });
        }

        const absolutePath = targetPath ? path.resolve(targetPath) : null;

        if (operation === 'write') {
            await fs.writeFile(absolutePath!, content, 'utf-8');
            return NextResponse.json({ success: true });
        } else if (operation === 'mkdir') {
            await fs.mkdir(absolutePath!, { recursive: true });
            return NextResponse.json({ success: true });
        } else if (operation === 'delete') {
            await fs.rm(absolutePath!, { recursive: true, force: true });
            return NextResponse.json({ success: true });
        } else if (operation === 'rename') {
            await fs.rename(path.resolve(oldPath), path.resolve(newPath));
            return NextResponse.json({ success: true });
        } else if (operation === 'gitInit') {
            await execAsync('git init', { cwd: absolutePath! });
            return NextResponse.json({ success: true });
        } else if (operation === 'gitAdd') {
            const { files } = await request.json();
            const fileList = files && files.length > 0 ? files.join(' ') : '.';
            await execAsync(`git add ${fileList}`, { cwd: absolutePath! });
            return NextResponse.json({ success: true });
        } else if (operation === 'gitCommit') {
            const { message } = await request.json();
            await execAsync(`git commit -m "${message}"`, { cwd: absolutePath! });
            return NextResponse.json({ success: true });
        } else if (operation === 'gitPush') {
            const { remote, branch } = await request.json();
            await execAsync(`git push ${remote} ${branch}`, { cwd: absolutePath! });
            return NextResponse.json({ success: true });
        } else if (operation === 'gitPull') {
            const { remote, branch } = await request.json();
            await execAsync(`git pull ${remote} ${branch}`, { cwd: absolutePath! });
            return NextResponse.json({ success: true });
        } else if (operation === 'gitBranch') {
            const { name } = await request.json();
            await execAsync(`git branch ${name}`, { cwd: absolutePath! });
            return NextResponse.json({ success: true });
        } else if (operation === 'gitCheckout') {
            const { name, create } = await request.json();
            if (create) {
                await execAsync(`git checkout -b ${name}`, { cwd: absolutePath! });
            } else {
                await execAsync(`git checkout ${name}`, { cwd: absolutePath! });
            }
            return NextResponse.json({ success: true });
        } else if (operation === 'gitRemoteAdd') {
            const { name, url } = await request.json();
            await execAsync(`git remote add ${name} ${url}`, { cwd: absolutePath! });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
