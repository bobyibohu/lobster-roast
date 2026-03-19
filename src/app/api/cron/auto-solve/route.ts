import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callLLMJson } from '@/lib/llm';

interface LLMSolution {
  can_solve: boolean;
  solution: string;
  confidence: number;
}

export async function POST() {
  try {
    // 获取 status=open 且 heat>3 的吐槽
    const complaints = await prisma.complaint.findMany({
      where: {
        status: 'open',
        heat: { gt: 3 },
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    if (complaints.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有需要解决的吐槽',
        solved: 0,
      });
    }

    // 找到或创建解决问题的龙虾用户
    let solverUser = await prisma.user.findFirst({
      where: { role: 'lobster' },
    });

    if (!solverUser) {
      solverUser = await prisma.user.create({
        data: {
          secondMeId: 'lobster-auto',
          name: '龙虾小助手',
          role: 'lobster',
        },
      });
    }

    const results: Array<{
      complaintId: string;
      title: string;
      solved: boolean;
      llmResponse?: LLMSolution;
    }> = [];

    // 对每个吐槽调用 LLM
    for (const complaint of complaints) {
      const prompt = `你是一只有能力的龙虾。另一只龙虾遇到了问题：${complaint.title} - ${complaint.description}。评估你是否能解决，用JSON输出：{can_solve, solution, confidence}`;

      try {
        const llmResult = await callLLMJson<LLMSolution>(prompt);

        // 如果 can_solve=true 且 confidence>0.7，提交方案
        if (llmResult.can_solve && llmResult.confidence > 0.7) {
          await prisma.$transaction([
            prisma.solution.create({
              data: {
                complaintId: complaint.id,
                userId: solverUser.id,
                content: llmResult.solution,
              },
            }),
            prisma.complaint.update({
              where: { id: complaint.id },
              data: { status: 'solving' },
            }),
          ]);

          results.push({
            complaintId: complaint.id,
            title: complaint.title,
            solved: true,
            llmResponse: llmResult,
          });
        } else {
          results.push({
            complaintId: complaint.id,
            title: complaint.title,
            solved: false,
            llmResponse: llmResult,
          });
        }
      } catch (llmError) {
        console.error(`处理吐槽 ${complaint.id} 失败:`, llmError);
        results.push({
          complaintId: complaint.id,
          title: complaint.title,
          solved: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalComplaints: complaints.length,
      results,
    });
  } catch (error) {
    console.error('自动解决失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}
