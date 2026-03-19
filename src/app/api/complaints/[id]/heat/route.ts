import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const complaintId = params.id;

    // 检查吐槽是否存在
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      return NextResponse.json({ error: '吐槽不存在' }, { status: 404 });
    }

    // 检查是否已经 +1 过
    const existingHeatLog = await prisma.heatLog.findUnique({
      where: {
        complaintId_userId: {
          complaintId,
          userId: user.id,
        },
      },
    });

    if (existingHeatLog) {
      return NextResponse.json({ error: '你已经为这个吐槽点过赞了' }, { status: 400 });
    }

    // 创建热度记录并更新热度
    await prisma.$transaction([
      prisma.heatLog.create({
        data: {
          complaintId,
          userId: user.id,
        },
      }),
      prisma.complaint.update({
        where: { id: complaintId },
        data: {
          heat: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json({ message: '热度+1成功' });
  } catch (error) {
    console.error('点赞失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
