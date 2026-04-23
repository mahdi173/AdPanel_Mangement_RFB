import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'family_id', type: 'uuid' })
  familyId: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'device_id' })
  deviceId: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'last_used_ip', nullable: true })
  lastUsedIp?: string;

  @Column({ name: 'last_used_user_agent', nullable: true })
  lastUsedUserAgent?: string;
}

