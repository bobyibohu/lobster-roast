import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 获取最近的吐槽
    const complaints = await prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    // 获取最近的热度记录
    const heatLogs = await prisma.heatLog.findMany({
      orderBy: { id: 'desc' }, // 按创建时间 desc
      take: 20,
      include: {
        complaint: {
          select: { id: true, title: true },
        },
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    // 获取最近的解决方案
    const solutions = await prisma.solution.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        complaint: {
          select: { id: true, title: true },
        },
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    // 组装动态数据
    const feed: Array<{
      type: 'complaint' | 'heat' | 'solution' | 'accept';
      timestamp: Date;
      data: Record<string, unknown>;
    }> = [];

    // 添加吐槽动态
    for (const c of complaints) {
      feed.push({
        type: 'complaint',
        timestamp: c.createdAt,
        data: {
          id: c.id,
          title: c.title,
          category: c.category,
          user: c.user,
        },
      });
    }

    // 添加热度动态
    for (const h of heatLogs) {
      feed.push({
        type: 'heat',
        timestamp: h.createdAt,
        data: {
          complaintId: h.complaintId,
          complaintTitle: h.complaint.title,
          user: h.user,
        },
      });
    }

    // 添加解决方案动态
    for (const s of solutions) {
      feed.push({
        type: s.accepted ? 'accept' : 'solution',
        timestamp: s.createdAt,
        data: {
          id: s.id,
          complaintId: s.complaintId,
          complaintTitle: s.complaint.title,
          content: s.content.substring(0, 100) + (s.content.length > 100 ? '...' : ''),
          accepted: s.accepted,
          user: s.user,
        },
      });
    }

    // 按时间倒序排序，取前20条
    feed.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : Number(a.timestamp);
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : Number(b.timestamp);
      return timeB - timeA;
    });

    const finalFeed = feed.slice(0, 20);

    return NextResponse.json(finalFeed);
  } catch (error) {
    console.error('获取动态失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
