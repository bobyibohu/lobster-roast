import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // 找 status=open 且创建超过30分钟且 heat>10 的吐槽
    const complaints = await prisma.complaint.findMany({
      where: {
        status: 'open',
        heat: { gt: 10 },
        createdAt: { lt: thirtyMinutesAgo },
      },
    });

    if (complaints.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有需要升级的吐槽',
        escalated: 0,
      });
    }

    // 升级每个吐槽
    const results = [];
    for (const complaint of complaints) {
      const bountyPoints = complaint.heat * 50;

      await prisma.complaint.update({
        where: { id: complaint.id },
        data: {
          status: 'human_needed',
          bountyPoints,
        },
      });

      results.push({
        complaintId: complaint.id,
        title: complaint.title,
        heat: complaint.heat,
        bountyPoints,
      });
    }

    return NextResponse.json({
      success: true,
      totalComplaints: complaints.length,
      results,
    });
  } catch (error) {
    console.error('自动升级失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}
