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
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: '请提供解决方案内容' }, { status: 400 });
    }

    // 检查吐槽是否存在
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      return NextResponse.json({ error: '吐槽不存在' }, { status: 404 });
    }

    // 创建解决方案并更新吐槽状态为 solving
    const [solution] = await prisma.$transaction([
      prisma.solution.create({
        data: {
          complaintId,
          userId: user.id,
          content,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
        },
      }),
      prisma.complaint.update({
        where: { id: complaintId },
        data: { status: 'solving' },
      }),
    ]);

    return NextResponse.json(solution, { status: 201 });
  } catch (error) {
    console.error('提交解决方案失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
