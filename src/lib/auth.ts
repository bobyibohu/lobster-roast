import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SECONDME_API = 'https://app.mindos.com/gate/in/rest/third-party-agent/v1';
export const SECONDME_AUTH_URL = 'https://second-me.cn/third-party-agent/auth';

export async function exchangeCodeForToken(code: string) {
  const res = await fetch(`${SECONDME_API}/auth/token/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const json = await res.json();
  if (json.code !== 0 || !json.data?.accessToken) {
    throw new Error(json.message || 'Token exchange failed');
  }
  return json.data as { accessToken: string; tokenType: string };
}

export async function fetchSecondMeProfile(accessToken: string) {
  const res = await fetch(`${SECONDME_API}/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || 'Failed to fetch profile');
  }
  return json.data as {
    name?: string;
    avatar?: string;
    aboutMe?: string;
    originRoute?: string;
    homepage?: string;
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const profile = await fetchSecondMeProfile(token);
    if (!profile) return null;

    const identifier = profile.originRoute || profile.name || 'unknown';

    let dbUser = await prisma.user.findFirst({
      where: { secondMeId: identifier },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          secondMeId: identifier,
          name: profile.name || '匿名用户',
          avatar: profile.avatar || null,
        },
      });
    } else if (dbUser.name !== profile.name || dbUser.avatar !== profile.avatar) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          name: profile.name || dbUser.name,
          avatar: profile.avatar || dbUser.avatar,
        },
      });
    }

    return { ...dbUser, aboutMe: profile.aboutMe, originRoute: profile.originRoute, homepage: profile.homepage };
  } catch {
    return null;
  }
}
