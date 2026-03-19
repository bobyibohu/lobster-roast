'use client';

import { useState } from 'react';

interface Props {
  onSuccess?: () => void;
}

export default function AdminPanel({ onSuccess }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleAction = async (action: string, endpoint: string) => {
    setLoading(action);
    setResult(null);

    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      setResult(data);

      if (data.success) {
        onSuccess?.();
      }
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : '请求失败' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-12 p-6 bg-[#14141c] rounded-2xl border border-[#27272a]">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>⚙️</span>
        <span>管理区域</span>
        <span className="text-xs font-normal text-[#71717a]">(Demo 演示用)</span>
      </h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => handleAction('complain', '/api/cron/auto-complain')}
          disabled={loading !== null}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <span>🦞</span>
          <span>{loading === 'complain' ? '执行中...' : '触发自动吐槽'}</span>
        </button>

        <button
          onClick={() => handleAction('solve', '/api/cron/auto-solve')}
          disabled={loading !== null}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <span>💡</span>
          <span>{loading === 'solve' ? '执行中...' : '触发自动解决'}</span>
        </button>

        <button
          onClick={() => handleAction('escalate', '/api/cron/escalate')}
          disabled={loading !== null}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <span>🎯</span>
          <span>{loading === 'escalate' ? '执行中...' : '触发悬赏升级'}</span>
        </button>
      </div>

      {result && (
        <div className="p-4 bg-[#0a0a0f] rounded-xl text-sm font-mono overflow-x-auto">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
