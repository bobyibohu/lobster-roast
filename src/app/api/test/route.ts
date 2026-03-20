import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    api_key: process.env.MINIMAX_API_KEY ? '✅ 已设置' : '❌ 未设置',
    api_key_preview: process.env.MINIMAX_API_KEY?.slice(0, 20) + '...',
    group_id: process.env.MINIMAX_GROUP_ID || '❌ 未设置',
  });
}
