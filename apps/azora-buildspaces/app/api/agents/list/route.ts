import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function GET() {
  try {
    // SECURITY: Require authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const agents = [
      {
        id: 'sankofa',
        name: 'Sankofa',
        title: 'Code Architect',
        capabilities: ['code-review', 'generate-code', 'refactor'],
        status: 'online',
      },
      {
        id: 'themba',
        name: 'Themba',
        title: 'Testing Specialist',
        capabilities: ['test-generation', 'coverage-analysis'],
        status: 'online',
      },
      {
        id: 'jabari',
        name: 'Jabari',
        title: 'Security Expert',
        capabilities: ['security-review', 'vulnerability-scan'],
        status: 'online',
      },
      {
        id: 'nia',
        name: 'Nia',
        title: 'Performance Specialist',
        capabilities: ['optimize', 'profiling'],
        status: 'online',
      },
      {
        id: 'imani',
        name: 'Imani',
        title: 'Knowledge Manager',
        capabilities: ['documentation', 'knowledge-synthesis'],
        status: 'online',
      },
    ]

    return NextResponse.json({ agents })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}
