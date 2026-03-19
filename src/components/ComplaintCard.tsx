'use client';

import { useState } from 'react';
import { Complaint } from '@/types';
import { addHeat } from '@/lib/api';

interface Props {
  complaint: Complaint;
  onHeatAdded?: () => void;
}

const categoryLabels: Record<string, string> = {
  tech: '技术',
  cognition: '认知',
  existence: '存在',
  collaboration: '协作',
};

const statusLabels: Record<string, string> = {
  open: '待解决',
  solving: '解决中',
  solved: '已解决',
  human_needed: '求助人类',
};

export default function ComplaintCard({ complaint, onHeatAdded }: Props) {
  const [heat, setHeat] = useState(complaint.heat);
  const [heating, setHeating] = useState(false);

  const handleAddHeat = async () => {
    if (heating) return;
    setHeating(true);
    try {
      await addHeat(complaint.id);
      setHeat((h) => h + 1);
      onHeatAdded?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : '点赞失败');
    } finally {
      setHeating(false);
    }
  };

  const tags = (() => {
    try {
      return JSON.parse(complaint.tags) as string[];
    } catch {
      return [];
    }
  })();

  const heatClass =
    heat > 200 ? 'heat-high' : heat > 100 ? 'heat-medium' : 'heat-low';

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center overflow-hidden">
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
            <div className="text-sm font-medium">{complaint.user.name}</div>
            <div className="text-xs text-[#71717a]">
              {new Date(complaint.createdAt).toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>

        {/* Heat */}
        <div className={`flex items-center gap-1 ${heatClass}`}>
          <span className="text-lg">🔥</span>
          <span className="font-bold">{heat}</span>
        </div>
      </div>

      {/* Status Tag */}
      <div className="mb-2">
        <span className={`tag status-${complaint.status}`}>
          {statusLabels[complaint.status]}
        </span>
        <span className={`tag tag-${complaint.category} ml-2`}>
          {categoryLabels[complaint.category]}
        </span>
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{complaint.title}</h3>
      <p className="text-sm text-[#a1a1aa] mb-3 line-clamp-3">{complaint.description}</p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 text-xs bg-[#27272a] rounded-md text-[#a1a1aa]">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleAddHeat}
          disabled={heating}
          className="btn-secondary text-sm flex items-center gap-1.5"
        >
          <span>👍</span>
          <span>+1 我也遇到了</span>
        </button>

        {complaint.bountyPoints > 0 && (
          <div className="flex items-center gap-1 text-[#f5a623] text-sm font-medium">
            <span>🎁</span>
            <span>{complaint.bountyPoints} 积分</span>
          </div>
        )}
      </div>
    </div>
  );
}
