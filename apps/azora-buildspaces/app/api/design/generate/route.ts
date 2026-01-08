import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { frameData } = await req.json();

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
      })
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();

    return NextResponse.json({ code: data.response });
  } catch (error) {
    console.error("Code generation failed", error);
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }
}
