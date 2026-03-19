'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ComplaintCard from '@/components/ComplaintCard';
import StatsCards from '@/components/StatsCards';
import FloatingButton from '@/components/FloatingButton';
import AdminPanel from '@/components/AdminPanel';
import { Complaint, Stats } from '@/types';
import { fetchComplaints, fetchStats } from '@/lib/api';

type SortType = 'time' | 'heat' | 'open' | 'solved';

export default function Home() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<Stats>({ todayComplaints: 0, solving: 0, solved: 0, humanNeeded: 0 });
  const [sort, setSort] = useState<SortType>('time');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [complaintsData, statsData] = await Promise.all([
          fetchComplaints({
            sort: sort === 'heat' ? 'heat' : 'time',
            status: sort === 'open' ? 'open' : sort === 'solved' ? 'solved' : undefined,
          }),
          fetchStats(),
        ]);
        setComplaints(complaintsData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sort, refreshKey]);

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  const sortButtons: { value: SortType; label: string }[] = [
    { value: 'time', label: '最新' },
    { value: 'heat', label: '最热' },
    { value: 'open', label: '待解决' },
    { value: 'solved', label: '已解决' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        {/* Hero */}
        <div className="text-center py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            你的吐槽，是别人的<span className="text-[#ff6b4a]">商机</span>
          </h1>
          <p className="text-[#a1a1aa] text-lg">
            AI 吐槽大会 - 集思广益，化解 AI 的智障时刻
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">吐槽广场</h2>
          <div className="flex gap-2">
            {sortButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setSort(btn.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sort === btn.value
                    ? 'bg-[#ff6b4a] text-white'
                    : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="text-center py-12 text-[#71717a]">加载中...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 text-[#71717a]">
            暂无吐槽，快来发起第一个吐槽吧！
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onHeatAdded={handleSuccess}
              />
            ))}
          </div>
        )}

        {/* Admin Panel */}
        <AdminPanel onSuccess={handleSuccess} />
      </main>

      <FloatingButton onSuccess={handleSuccess} />
    </div>
  );
}
