export type SecurityEventLevel = 'low' | 'middle' | 'high';

export type SecurityEventRecord = {
  id: string;
  userId: string;
  level: SecurityEventLevel;
  type: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  isRead: boolean;
};

export interface CreateSecurityEventInput {
  userId: string;
  level: SecurityEventLevel;
  type: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface SecurityEventRepository {
  create(input: CreateSecurityEventInput): Promise<void>;
  listByUser(userId: string, limit?: number): Promise<SecurityEventRecord[]>;
  listAlertsByUser(userId: string, limit?: number): Promise<SecurityEventRecord[]>;
  listAll(limit?: number): Promise<SecurityEventRecord[]>;
  markAllRead(userId: string): Promise<void>;
}

export const SECURITY_EVENT_REPOSITORY = 'SECURITY_EVENT_REPOSITORY';

