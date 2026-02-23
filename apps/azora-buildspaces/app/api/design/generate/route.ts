import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Require authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { frameData } = await req.json();

    // Try orchestrator first
    try {
      const response = await fetch('http://localhost:3010', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          did: "did:key:z6MkpTHR8V369",
          signature: "UNSIGNED",
          payload: {
            type: "AGENT_TASK",
            room: "Design Studio",
            intent: "Generate React component from Figma frame data",
            payload: { frameData }
          }
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ code: data.response });
      }
    } catch (orchestratorError) {
      console.log('Orchestrator unavailable, using OpenAI fallback');
    }

    // Fallback to OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({
        code: `// Design-to-code generation requires OpenAI API key
// Please set OPENAI_API_KEY environment variable

import React from 'react';

const GeneratedComponent = () => {
  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Generated Component</h3>
      <p className="text-gray-600">Configure OpenAI API key to enable design-to-code generation</p>
      <div className="mt-4 space-y-2">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default GeneratedComponent;`
      });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const prompt = `Generate a React component based on this Figma frame data:
${JSON.stringify(frameData, null, 2)}

Please create a modern React component with:
- TypeScript types
- Tailwind CSS classes
- Responsive design
- Clean, semantic HTML
- Proper component structure

Return only the component code, no explanations.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert React developer specializing in converting design mockups to clean, production-ready React components. Focus on accessibility, performance, and modern best practices.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const generatedCode = completion.choices[0]?.message?.content || '// Failed to generate code';

    return NextResponse.json({ code: generatedCode });
  } catch (error) {
    console.error("Code generation failed", error);
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }
}
