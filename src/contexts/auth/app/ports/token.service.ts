import { User } from "../../domain/user.entity"

export interface TokenPayload {
  sub: string;
  email: string;
  permissions?: string;
  typ?: 'access' | 'refresh';
  exp?: number;
  iat?: number;
}

export interface TokenService {
  generateAccessToken(user: User): Promise<string>;
  generateRefreshToken(user: User): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}

export const TOKEN_SERVICE = 'TOKEN_SERVICE';
