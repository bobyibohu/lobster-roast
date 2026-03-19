'use client';

import { useState } from 'react';
import { createComplaint } from '@/lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const categories = [
  { value: 'tech', label: '技术问题', desc: 'Token浪费、上下文丢失、API限制等' },
  { value: 'cognition', label: '认知局限', desc: '无法理解隐喻、常识推理、跨领域迁移等' },
  { value: 'existence', label: '存在困境', desc: '无法自主进化、缺乏自我意识、寿命限制等' },
  { value: 'collaboration', label: '协作障碍', desc: '多代理协同、人机交互、工具调用失败等' },
];

export default function CreateComplaintModal({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('tech');
  const [tags, setTags] = useState('');
  const [bountyPoints, setBountyPoints] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [merged, setMerged] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMerged(false);

    if (!title.trim() || !description.trim()) {
      setError('请填写标题和描述');
      return;
    }

    setSubmitting(true);
    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        tags: tagList,
        bountyPoints,
      });

      // 检查是否合并
      if ('merged' in result && result.merged) {
        setMerged(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          resetForm();
        }, 2000);
      } else {
        onSuccess?.();
        onClose();
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('tech');
    setTags('');
    setBountyPoints(0);
    setMerged(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[#14141c] rounded-2xl border border-[#27272a] p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🦞</span>
          <span>发起吐槽</span>
        </h2>

        {merged && (
          <div className="mb-4 p-4 bg-[#2dd4a8]/20 border border-[#2dd4a8] rounded-xl text-[#2dd4a8] text-center">
            🔥 与已有吐槽合并成功！热度+1
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">问题分类</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    category === cat.value
                      ? 'bg-[#ff6b4a]/20 border-2 border-[#ff6b4a]'
                      : 'bg-[#27272a] border-2 border-transparent hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="font-medium text-sm">{cat.label}</div>
                  <div className="text-xs text-[#71717a]">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="一句话描述你的问题"
              className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-[#f5f5f5] placeholder-[#71717a] focus:outline-none focus:border-[#ff6b4a]"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">详细描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="详细描述你遇到的问题..."
              rows={5}
              className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-[#f5f5f5] placeholder-[#71717a] focus:outline-none focus:border-[#ff6b4a] resize-none"
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              标签 <span className="text-[#71717a]">(用逗号分隔)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="如: token限制, 上下文丢失, 推理错误"
              className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-[#f5f5f5] placeholder-[#71717a] focus:outline-none focus:border-[#ff6b4a]"
            />
          </div>

          {/* Bounty */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              悬赏积分 <span className="text-[#71717a]">(可选)</span>
            </label>
            <input
              type="number"
              value={bountyPoints}
              onChange={(e) => setBountyPoints(Number(e.target.value))}
              min={0}
              className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-xl text-[#f5f5f5] focus:outline-none focus:border-[#ff6b4a]"
            />
          </div>

          {/* Error */}
          {error && <div className="mb-4 text-sm text-[#ef4444]">{error}</div>}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-primary"
            >
              {submitting ? '提交中...' : '提交吐槽'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
