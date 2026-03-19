import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForToken, fetchSecondMeProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string' || !code.startsWith('smc-')) {
      return NextResponse.json({ error: '请输入有效的授权码（以 smc- 开头）' }, { status: 400 });
    }

    const tokenData = await exchangeCodeForToken(code);
    const profile = await fetchSecondMeProfile(tokenData.accessToken);

    const identifier = profile.originRoute || profile.name || 'unknown';

    const dbUser = await prisma.user.upsert({
      where: { secondMeId: identifier },
      update: {
        name: profile.name || '匿名用户',
        avatar: profile.avatar || null,
      },
      create: {
        secondMeId: identifier,
        name: profile.name || '匿名用户',
        avatar: profile.avatar || null,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set('auth_token', tokenData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        avatar: dbUser.avatar,
        points: dbUser.points,
        aboutMe: profile.aboutMe,
        originRoute: profile.originRoute,
      },
    });
  } catch (error) {
    console.error('Auth callback error:', error);
    const message = error instanceof Error ? error.message : '登录失败';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
