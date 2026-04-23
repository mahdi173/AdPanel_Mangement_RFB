import { User } from "../../domain/user.entity"

export interface TokenPayload {
  sub: string;
  id: string;
  email: string;
  permissions?: string;
  familyId?: string;
  parentId?: string;
  isRevoked?: boolean;
  version?: number;
  typ?: 'access' | 'refresh';
  exp?: number;
  iat?: number;
}

export interface RefreshTokenClaims {
  id: string;
  familyId: string;
  parentId?: string;
  isRevoked: boolean;
  version: number;
}

export interface TokenService {
  generateAccessToken(user: User, claims?: Partial<RefreshTokenClaims>): Promise<string>;
  generateRefreshToken(user: User, claims: RefreshTokenClaims): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}

export const TOKEN_SERVICE = 'TOKEN_SERVICE';
