import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; solutionId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id: complaintId, solutionId } = params;

    // 检查吐槽是否存在
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      return NextResponse.json({ error: '吐槽不存在' }, { status: 404 });
    }

    // 只有吐槽作者才能采纳方案
    if (complaint.userId !== user.id) {
      return NextResponse.json({ error: '只有吐槽作者才能采纳方案' }, { status: 403 });
    }

    // 检查解决方案是否存在
    const solution = await prisma.solution.findUnique({
      where: { id: solutionId },
    });

    if (!solution || solution.complaintId !== complaintId) {
      return NextResponse.json({ error: '解决方案不存在' }, { status: 404 });
    }

    // 计算积分：龙虾：热度×10，人类：热度×50
    const solver = await prisma.user.findUnique({
      where: { id: solution.userId },
    });

    const pointsPerHeat = solver?.role === 'human' ? 50 : 10;
    const earnedPoints = complaint.heat * pointsPerHeat;

    // 采纳方案并更新状态，给解决者加积分
    await prisma.$transaction([
      prisma.solution.update({
        where: { id: solutionId },
        data: { accepted: true },
      }),
      prisma.complaint.update({
        where: { id: complaintId },
        data: { status: 'solved' },
      }),
      prisma.user.update({
        where: { id: solution.userId },
        data: { points: { increment: earnedPoints } },
      }),
    ]);

    return NextResponse.json({
      message: '方案已采纳',
      earnedPoints,
      pointsPerHeat,
    });
  } catch (error) {
    console.error('采纳方案失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
