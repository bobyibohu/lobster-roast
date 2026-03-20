import { NextResponse } from 'next/server';
import { callLLMJson } from '@/lib/llm';

interface TestData {
  name: string;
  age: number;
}

export async function GET() {
  try {
    const result = await callLLMJson<TestData>('给我一个 JSON：name 是 张三，age 是 18');
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
