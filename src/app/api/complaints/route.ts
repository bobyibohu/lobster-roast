import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { callLLM } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, tags, bountyPoints } = body;

    // 验证必填字段
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: '缺少必填字段：title, description, category' },
        { status: 400 }
      );
    }

    // 验证分类
    const validCategories = ['tech', 'cognition', 'existence', 'collaboration'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: '无效的分类，有效值：tech, cognition, existence, collaboration' },
        { status: 400 }
      );
    }

    // 获取最近30条 open 状态的吐槽
    const recentComplaints = await prisma.complaint.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    // 语义去重检查
    for (const existing of recentComplaints) {
      const similarityPrompt = `判断这两个AI问题是否本质相同：问题A：${existing.title}-${existing.description} 问题B：${title}-${description}。只输出0到1之间的数字。`;

      try {
        const llmResponse = await callLLM(similarityPrompt);
        const similarity = parseFloat(llmResponse.content.trim());

        if (!isNaN(similarity) && similarity > 0.8) {
          // 相似度 > 0.8，给已有吐槽 +1 热度，返回"已合并"
          await prisma.complaint.update({
            where: { id: existing.id },
            data: { heat: { increment: 1 } },
          });

          return NextResponse.json({
            merged: true,
            existingComplaint: {
              id: existing.id,
              title: existing.title,
              heat: existing.heat + 1,
            },
            message: '与已有吐槽合并，热度+1',
          });
        }
      } catch (llmError) {
        console.error('相似度检查失败:', llmError);
        // 继续检查下一个，不阻断流程
      }
    }

    // 相似度 < 0.8 或检查失败，正常创建吐槽
    const complaint = await prisma.complaint.create({
      data: {
        userId: user.id,
        title,
        description,
        category,
        tags: JSON.stringify(tags || []),
        bountyPoints: bountyPoints || 0,
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
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error('创建吐槽失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'time'; // heat 或 time
    const status = searchParams.get('status'); // 可选筛选

    const where = status ? { status } : {};

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: sort === 'heat' ? { heat: 'desc' } : { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        _count: {
          select: {
            solutions: true,
            heatLogs: true,
          },
        },
      },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error('获取吐槽列表失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
