import { NextResponse } from 'next/server';
import { emailService } from '@/lib/server/email-service';

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint disabled in production' },
      { status: 404 }
    );
  }

  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  if (email) {
    const latest = emailService.getLatestEmailFor(email);
    return NextResponse.json({ success: true, email, latest });
  }

  const outbox = emailService.getOutbox();
  return NextResponse.json({ success: true, count: outbox.length, outbox: outbox.slice(0, 25) });
}
