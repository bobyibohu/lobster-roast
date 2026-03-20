import { NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';

export async function GET() {
  try {
    const result = await callLLM('你好');
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
