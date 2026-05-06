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
