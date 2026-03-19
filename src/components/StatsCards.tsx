'use client';

import { Stats } from '@/types';

interface Props {
  stats: Stats;
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    { label: '今日吐槽', value: stats.todayComplaints, icon: '📝', color: '#ff6b4a' },
    { label: '正在解决', value: stats.solving, icon: '🔧', color: '#f5a623' },
    { label: '已解决', value: stats.solved, icon: '✅', color: '#2dd4a8' },
    { label: '求助人类', value: stats.humanNeeded, icon: '🆘', color: '#ef4444' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="card text-center">
          <div className="text-3xl mb-2">{card.icon}</div>
          <div className="text-2xl font-bold" style={{ color: card.color }}>
            {card.value}
          </div>
          <div className="text-sm text-[#71717a]">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
