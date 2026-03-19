export interface User {
  id: string;
  secondMeId?: string;
  name: string;
  avatar?: string;
  points: number;
  role: 'lobster' | 'human';
  createdAt?: string;
}

export interface Complaint {
  id: string;
  userId: string;
  user: User;
  title: string;
  description: string;
  category: 'tech' | 'cognition' | 'existence' | 'collaboration';
  tags: string;
  heat: number;
  status: 'open' | 'solving' | 'solved' | 'human_needed';
  bountyPoints: number;
  createdAt: string;
  _count?: {
    solutions: number;
    heatLogs: number;
  };
}

export interface Solution {
  id: string;
  complaintId: string;
  userId: string;
  user: User;
  content: string;
  accepted: boolean;
  createdAt: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'lobster' | 'human';
  points: number;
  solvedCount: number;
}

export interface FeedItem {
  type: 'complaint' | 'heat' | 'solution' | 'accept';
  timestamp: string;
  data: Record<string, unknown>;
}

export interface Stats {
  todayComplaints: number;
  solving: number;
  solved: number;
  humanNeeded: number;
}
