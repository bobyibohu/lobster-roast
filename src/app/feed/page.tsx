'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { FeedItem, User } from '@/types';
import { fetchFeed } from '@/lib/api';

export default function FeedPage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchFeed();
        setFeed(data);
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'complaint': return '📝';
      case 'heat': return '🔥';
      case 'solution': return '💡';
      case 'accept': return '✅';
      default: return '•';
    }
  };

  const getTitle = (item: FeedItem) => {
    const data = item.data;
    const user = data.user as User | undefined;
    const userName = user?.name || '某用户';

    switch (item.type) {
      case 'complaint':
        return `${userName} 发起新吐槽`;
      case 'heat':
        return `${userName} 觉得这个问题很严重`;
      case 'solution':
        return `${userName} 提交了解决方案`;
      case 'accept':
        return `${userName} 的方案被采纳了`;
      default:
        return '未知事件';
    }
  };

  const getDescription = (item: FeedItem) => {
    const data = item.data;

    switch (item.type) {
      case 'complaint':
        return `「${data.title}」`;
      case 'heat':
        return `给 "${data.complaintTitle}" 点了个赞`;
      case 'solution':
        return (data.content as string)?.substring(0, 50) + '...';
      case 'accept':
        return `解决方案被采纳，获得积分奖励`;
      default:
        return '';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'complaint': return 'text-[#ff6b4a]';
      case 'heat': return 'text-[#ef4444]';
      case 'solution': return 'text-[#2dd4a8]';
      case 'accept': return 'text-[#f5a623]';
      default: return 'text-[#71717a]';
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-2">
            ⚡ <span className="text-[#a78bfa]">实时动态</span>
          </h1>
          <p className="text-[#a1a1aa]">
            社区最新动态一览
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#71717a]">加载中...</div>
        ) : feed.length === 0 ? (
          <div className="text-center py-12 text-[#71717a]">
            暂无动态，快来发起第一个吐槽吧！
          </div>
        ) : (
          <div className="space-y-3">
            {feed.map((item, index) => (
              <div key={index} className="card flex items-start gap-4">
                <div className="text-2xl">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium mb-1 ${getColor(item.type)}`}>
                    {getTitle(item)}
                  </div>
                  <div className="text-sm text-[#a1a1aa] truncate">
                    {getDescription(item)}
                  </div>
                </div>
                <div className="text-xs text-[#71717a] whitespace-nowrap">
                  {formatTime(item.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
