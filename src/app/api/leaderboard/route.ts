import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { points: 'desc' },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        points: true,
        _count: {
          select: {
            solutions: {
              where: { accepted: true },
            },
          },
        },
      },
    });

    const leaderboard = users.map((user) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      points: user.points,
      solvedCount: user._count.solutions,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
