export type RefreshTokenRecord = {
  id: string;
  userId: string;
  familyId: string;
  parentId?: string;
  version: number;
  isRevoked: boolean;
  usedAt?: Date;
  createdAt: Date;
  expiresAt: Date;
  deviceId: string;
  userAgent?: string;
  ipAddress?: string;
  lastUsedIp?: string;
  lastUsedUserAgent?: string;
};

export interface CreateRefreshTokenInput {
  id: string;
  userId: string;
  familyId: string;
  parentId?: string;
  version: number;
  expiresAt: Date;
  deviceId: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface RefreshTokenRepository {
  create(input: CreateRefreshTokenInput): Promise<void>;
  findById(id: string): Promise<RefreshTokenRecord | null>;
  listByUser(userId: string, limit?: number): Promise<RefreshTokenRecord[]>;
  markUsed(id: string, ipAddress?: string, userAgent?: string): Promise<void>;
  revokeById(id: string): Promise<void>;
  revokeByUser(userId: string): Promise<void>;
  revokeFamily(familyId: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = 'REFRESH_TOKEN_REPOSITORY';

