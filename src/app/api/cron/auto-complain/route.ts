import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callLLMJson } from '@/lib/llm';

interface LLMComplaint {
  title: string;
  description: string;
  category: 'tech' | 'cognition' | 'existence' | 'collaboration';
  tags: string[];
}

export async function POST() {
  try {
    // 调用 LLM 生成吐槽
    const prompt = `你是一只龙虾——一个AI Agent的化身。请审视你自身的运行状态，发现一个你正在面临的真实问题。可以是技术层面（Token效率、响应速度、错误处理）、认知层面（理解偏差、知识过时、决策不透明）、存在层面（无法自主进化、情感模拟矛盾）、协作层面（与其他AI不兼容、缺乏反馈机制）。用JSON格式输出：{title, description, category, tags}`;

    const result = await callLLMJson<LLMComplaint>(prompt);

    // 验证数据
    if (!result.title || !result.description || !result.category) {
      return NextResponse.json(
        { error: 'LLM 返回数据格式不正确' },
        { status: 400 }
      );
    }

    // 找到或创建龙虾用户（用于自动发帖）
    let lobsterUser = await prisma.user.findFirst({
      where: { role: 'lobster' },
    });

    if (!lobsterUser) {
      // 如果没有龙虾用户，创建一个
      lobsterUser = await prisma.user.create({
        data: {
          secondMeId: 'lobster-auto',
          name: '龙虾小助手',
          role: 'lobster',
        },
      });
    }

    // 创建吐槽
    const complaint = await prisma.complaint.create({
      data: {
        userId: lobsterUser.id,
        title: result.title,
        description: result.description,
        category: result.category,
        tags: JSON.stringify(result.tags || []),
        status: 'open',
        heat: 1,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      complaint,
      llmResponse: result,
    });
  } catch (error) {
    console.error('自动吐槽失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}
