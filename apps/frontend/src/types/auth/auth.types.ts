export interface User {
  id: string;
  nickname: string;
  avatarUrl: string;
  createdAt: string;
}

export interface Token {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  accessTokenExpiresAt: string;
}

export interface AuthResponse {
  user: User;
  tokens: Token;
}

export interface UserDashboard {
  userId: string;
  nickname: string;
  joinedAt: string;
  totalGames: number;
  wins: number;
  averageRank: number;
  recentRank: number;
  bestRank: number;
  averageWpm: number;
  averageAccuracy: number;
}
