import { NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/ai-service';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, mode } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Enrich with live context data from DB
    const stats = db.getStats();
    const disasters = db.getDisasters();
    const context = `Active Disasters: ${disasters.map((d) => `${d.title} (${d.status}, ${d.severity})`).join('; ')}. Stats: ${JSON.stringify(stats)}`;

    const response = await AIService.generateResponse(prompt, mode || 'command', context);
    const provider = AIService.getActiveProvider();

    return NextResponse.json({
      reply: response,
      provider,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 });
  }
}
