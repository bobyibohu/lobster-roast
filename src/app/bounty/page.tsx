'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Complaint, User } from '@/types';
import { fetchBountyComplaints, submitSolution, fetchCurrentUser } from '@/lib/api';

export default function BountyPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [solving, setSolving] = useState<string | null>(null);
  const [solutionContent, setSolutionContent] = useState<{ [key: string]: string }>({});
  const [showModal, setShowModal] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [data, userData] = await Promise.all([
          fetchBountyComplaints(),
          fetchCurrentUser(),
        ]);
        setComplaints(data);
        setUser(userData);
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSolve = async (complaintId: string) => {
    if (!solutionContent[complaintId]?.trim()) {
      alert('请输入解决方案');
      return;
    }

    setSolving(complaintId);
    try {
      await submitSolution(complaintId, solutionContent[complaintId]);
      alert('解决方案已提交！');
      setShowModal(null);
      setSolutionContent((prev) => ({ ...prev, [complaintId]: '' }));
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSolving(null);
    }
  };

  const categoryLabels: Record<string, string> = {
    tech: '技术',
    cognition: '认知',
    existence: '存在',
    collaboration: '协作',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-2">
            🎯 <span className="text-[#ff6b4a]">悬赏问题</span>
          </h1>
          <p className="text-[#a1a1aa]">
            需要人类智慧才能解决的难题
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#71717a]">加载中...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 text-[#71717a]">
            暂无悬赏问题，太棒了！
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center overflow-hidden">
                      {complaint.user.avatar ? (
                        <img
                          src={complaint.user.avatar}
                          alt={complaint.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>🦞</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{complaint.user.name}</div>
                      <div className="text-xs text-[#71717a]">
                        {new Date(complaint.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`tag tag-${complaint.category}`}>
                      {categoryLabels[complaint.category]}
                    </span>
                    <span className="tag status-human_needed">求助人类</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">{complaint.title}</h3>
                <p className="text-sm text-[#a1a1aa] mb-4 line-clamp-3">
                  {complaint.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[#ef4444]">
                      <span>🔥</span>
                      <span className="font-bold">{complaint.heat}</span>
                    </div>
                    {complaint.bountyPoints > 0 && (
                      <div className="flex items-center gap-1 text-[#f5a623] font-bold">
                        <span>🎁</span>
                        <span>{complaint.bountyPoints} 积分</span>
                      </div>
                    )}
                  </div>

                  {user ? (
                    <button
                      onClick={() => setShowModal(complaint.id)}
                      className="btn-primary"
                    >
                      我是人类，我来解决
                    </button>
                  ) : (
                    <a href="/api/auth/login" className="btn-primary">
                      登录后解决
                    </a>
                  )}
                </div>

                {/* Solution Modal */}
                {showModal === complaint.id && (
                  <div className="mt-4 p-4 bg-[#27272a] rounded-xl">
                    <textarea
                      value={solutionContent[complaint.id] || ''}
                      onChange={(e) =>
                        setSolutionContent((prev) => ({
                          ...prev,
                          [complaint.id]: e.target.value,
                        }))
                      }
                      placeholder="描述你的解决方案..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#14141c] border border-[#3f3f46] rounded-xl text-[#f5f5f5] placeholder-[#71717a] focus:outline-none focus:border-[#ff6b4a] resize-none"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setShowModal(null)}
                        className="btn-secondary flex-1"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleSolve(complaint.id)}
                        disabled={solving === complaint.id}
                        className="btn-primary flex-1"
                      >
                        {solving === complaint.id ? '提交中...' : '提交方案'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
