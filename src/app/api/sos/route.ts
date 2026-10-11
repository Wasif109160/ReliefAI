import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AIService } from '@/lib/ai/ai-service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const priority = searchParams.get('priority');
  const status = searchParams.get('status');

  let requests = db.getSOSRequests();
  if (priority) {
    requests = requests.filter((r) => r.priority === priority.toUpperCase());
  }
  if (status) {
    requests = requests.filter((r) => r.status === status.toLowerCase());
  }

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.details || !body.reporterName) {
      return NextResponse.json({ error: 'Missing mandatory fields: details and reporterName' }, { status: 400 });
    }

    // Run AI Triage Engine on the SOS report
    const aiAnalysis = await AIService.analyzeSOS({
      details: body.details,
      trappedCount: Number(body.trappedCount || 0),
      injuriesCount: Number(body.injuriesCount || 0),
      specialNeeds: body.specialNeeds || [],
      hasRisingWater: Boolean(body.needsBoat),
    });

    const newSOS = db.createSOS({
      reporterName: body.reporterName,
      phone: body.phone || '+1 (555) 911-0000',
      disasterId: body.disasterId || 'dis-001',
      location: body.location || {
        address: body.address || 'Reported Location',
        lat: body.lat || 45.515,
        lng: body.lng || -122.678,
      },
      urgencyScore: aiAnalysis.urgencyScore,
      priority: aiAnalysis.priority,
      details: body.details,
      trappedCount: Number(body.trappedCount || 0),
      injuriesCount: Number(body.injuriesCount || 0),
      specialNeeds: body.specialNeeds || [],
      needsBoat: Boolean(body.needsBoat || aiAnalysis.suggestedTeamType === 'swift_water'),
      needsMedical: Boolean(body.needsMedical || body.injuriesCount > 0),
      needsFoodWater: Boolean(body.needsFoodWater),
      aiTriageSummary: aiAnalysis.triageSummary,
    });

    return NextResponse.json({ sos: newSOS, aiAnalysis }, { status: 201 });
  } catch (err) {
    console.error('Error creating SOS:', err);
    return NextResponse.json({ error: 'Failed to process SOS request' }, { status: 500 });
  }
}
