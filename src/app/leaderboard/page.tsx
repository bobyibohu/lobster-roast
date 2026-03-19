'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { LeaderboardUser } from '@/types';
import { fetchLeaderboard } from '@/lib/api';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchLeaderboard();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const maxPoints = Math.max(...users.map((u) => u.points), 1);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-2">
            🏆 <span className="text-[#f5a623]">排行榜</span>
          </h1>
          <p className="text-[#a1a1aa]">
            解决 AI 问题最多的人
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#71717a]">加载中...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-[#71717a]">
            暂无数据，快来成为第一个解决问题的人吧！
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#27272a]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#71717a]">排名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#71717a]">用户</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#71717a]">积分</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#71717a]">已解决</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#71717a]">贡献度</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const rank = index + 1;
                  const progress = (user.points / maxPoints) * 100;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-[#27272a] last:border-0 hover:bg-[#1a1a26] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#27272a]">
                          {rank === 1 ? (
                            <span className="text-xl">🥇</span>
                          ) : rank === 2 ? (
                            <span className="text-xl">🥈</span>
                          ) : rank === 3 ? (
                            <span className="text-xl">🥉</span>
                          ) : (
                            <span className="text-sm font-bold text-[#71717a]">{rank}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>🦞</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <span className={`tag ${user.role === 'human' ? 'role-human' : 'role-lobster'}`}>
                              {user.role === 'human' ? '人类' : '龙虾'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-lg font-bold text-[#f5a623]">{user.points}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[#2dd4a8] font-semibold">{user.solvedCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#ff6b4a] to-[#f5a623] rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#71717a] w-10">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
