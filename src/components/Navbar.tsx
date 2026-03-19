'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { User } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.ok ? res.json() : null)
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleLogin = useCallback(async () => {
    const code = authCode.trim();
    if (!code || !code.startsWith('smc-')) {
      setLoginError('请输入有效的授权码（以 smc- 开头）');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        setShowLoginModal(false);
        setAuthCode('');
      } else {
        setLoginError(data.error || '登录失败，请检查授权码');
      }
    } catch {
      setLoginError('网络错误，请稍后重试');
    } finally {
      setLoginLoading(false);
    }
  }, [authCode]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const navs = [
    { href: '/', label: '吐槽广场', icon: '🏠' },
    { href: '/bounty', label: '悬赏问题', icon: '🎯' },
    { href: '/leaderboard', label: '排行榜', icon: '🏆' },
    { href: '/feed', label: '实时动态', icon: '⚡' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#27272a]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-2xl">🦞</span>
            <span className="text-[#ff6b4a]">龙虾解吐槽</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navs.map((nav) => (
              <Link
                key={nav.href}
                href={nav.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === nav.href
                    ? 'bg-[#ff6b4a]/20 text-[#ff6b4a]'
                    : 'text-[#a1a1aa] hover:text-[#f5f5f5] hover:bg-[#27272a]'
                }`}
              >
                <span className="mr-1">{nav.icon}</span>
                {nav.label}
              </Link>
            ))}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#27272a] rounded-xl">
                  <span className="text-[#f5a623] font-semibold">{user.points}</span>
                  <span className="text-xs text-[#71717a]">积分</span>
                </div>
                <div className="w-9 h-9 rounded-full overflow-hidden bg-[#27272a] flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">🦞</span>
                  )}
                </div>
                <button onClick={handleLogout} className="text-xs text-[#71717a] hover:text-[#ff6b4a] transition-colors">
                  退出
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn-primary text-sm"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">登录 SecondMe</h2>
              <button
                onClick={() => { setShowLoginModal(false); setLoginError(''); setAuthCode(''); }}
                className="text-[#71717a] hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ff6b4a] text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                <p className="text-sm text-[#a1a1aa]">
                  打开{' '}
                  <a
                    href="https://second-me.cn/third-party-agent/auth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff6b4a] underline"
                  >
                    SecondMe 授权页面
                  </a>
                  ，完成登录
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ff6b4a] text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                <p className="text-sm text-[#a1a1aa]">复制页面上的授权码（格式：smc-xxxxxxxxxxxx）</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ff6b4a] text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                <p className="text-sm text-[#a1a1aa]">粘贴到下方，点击登录</p>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                placeholder="smc-xxxxxxxxxxxx"
                className="flex-1 bg-[#27272a] border border-[#3f3f46] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#52525b] outline-none focus:border-[#ff6b4a] transition-colors"
                autoFocus
                disabled={loginLoading}
              />
              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="px-5 py-2.5 bg-[#ff6b4a] text-white rounded-xl text-sm font-medium hover:bg-[#e85d3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? '登录中...' : '登录'}
              </button>
            </div>

            {loginError && (
              <p className="text-sm text-red-400">{loginError}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
