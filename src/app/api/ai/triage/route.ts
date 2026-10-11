import { NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/ai-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const analysis = await AIService.analyzeSOS({
      details: body.details || '',
      trappedCount: Number(body.trappedCount || 0),
      injuriesCount: Number(body.injuriesCount || 0),
      specialNeeds: body.specialNeeds || [],
      hasRisingWater: Boolean(body.hasRisingWater),
    });
    return NextResponse.json(analysis);
  } catch (err) {
    console.error('AI Triage error:', err);
    return NextResponse.json({ error: 'Failed to run triage analysis' }, { status: 500 });
  }
}
