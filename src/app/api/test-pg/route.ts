import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  try {
    const client = new Client({
      host: 'db.phudcsxuhymhllzitpsy.supabase.co',
      port: 5432,
      user: 'postgres',
      password: 'Bobhu990203.',
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    const result = await client.query('SELECT NOW() as time');
    await client.end();
    return NextResponse.json({ success: true, time: result.rows[0].time });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
