import { Complaint, LeaderboardUser, FeedItem, Stats } from '@/types';

const API_BASE = '';

export async function fetchComplaints(params?: {
  sort?: 'heat' | 'time';
  status?: string;
}): Promise<Complaint[]> {
  const searchParams = new URLSearchParams();
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.status) searchParams.set('status', params.status);

  const res = await fetch(`${API_BASE}/api/complaints?${searchParams}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch complaints');
  return res.json();
}

export async function createComplaint(data: {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  bountyPoints?: number;
}): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/api/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create complaint');
  return res.json();
}

export async function addHeat(complaintId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/complaints/${complaintId}/heat`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to add heat');
}

export async function fetchBountyComplaints(): Promise<Complaint[]> {
  const res = await fetch(`${API_BASE}/api/complaints?status=human_needed&sort=heat`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch bounty complaints');
  return res.json();
}

export async function submitSolution(complaintId: string, content: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/complaints/${complaintId}/solutions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to submit solution');
}

export async function fetchLeaderboard(): Promise<LeaderboardUser[]> {
  const res = await fetch(`${API_BASE}/api/leaderboard`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function fetchFeed(): Promise<FeedItem[]> {
  const res = await fetch(`${API_BASE}/api/feed`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch feed');
  return res.json();
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const complaints = await fetchComplaints();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayComplaints = complaints.filter((c) => {
    const created = new Date(c.createdAt);
    return created >= today;
  }).length;

  return {
    todayComplaints,
    solving: complaints.filter((c) => c.status === 'solving').length,
    solved: complaints.filter((c) => c.status === 'solved').length,
    humanNeeded: complaints.filter((c) => c.status === 'human_needed').length,
  };
}
