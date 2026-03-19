import { NextResponse } from 'next/server';
import { SECONDME_AUTH_URL } from '@/lib/auth';

export async function GET() {
  return NextResponse.json({ authUrl: SECONDME_AUTH_URL });
}
