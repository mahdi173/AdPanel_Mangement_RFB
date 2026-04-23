import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRefreshTokenInput,
  RefreshTokenRecord,
  RefreshTokenRepository,
} from '../app/ports/refresh-token.repository';
import { RefreshTokenEntity } from './typeorm/refresh-token.persistence-entity';

@Injectable()
export class TypeOrmRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly repository: Repository<RefreshTokenEntity>,
  ) {}

  async create(input: CreateRefreshTokenInput): Promise<void> {
    const entity = this.repository.create({
      id: input.id,
      userId: input.userId,
      familyId: input.familyId,
      parentId: input.parentId,
      version: input.version,
      isRevoked: false,
      expiresAt: input.expiresAt,
      deviceId: input.deviceId,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });
    await this.repository.save(entity);
  }

  async findById(id: string): Promise<RefreshTokenRecord | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return {
      id: entity.id,
      userId: entity.userId,
      familyId: entity.familyId,
      parentId: entity.parentId,
      version: entity.version,
      isRevoked: entity.isRevoked,
      usedAt: entity.usedAt,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
      deviceId: entity.deviceId,
      userAgent: entity.userAgent,
      ipAddress: entity.ipAddress,
      lastUsedIp: entity.lastUsedIp,
      lastUsedUserAgent: entity.lastUsedUserAgent,
    };
  }

  async listByUser(userId: string, limit = 100): Promise<RefreshTokenRecord[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return entities.map((entity) => ({
      id: entity.id,
      userId: entity.userId,
      familyId: entity.familyId,
      parentId: entity.parentId,
      version: entity.version,
      isRevoked: entity.isRevoked,
      usedAt: entity.usedAt,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
      deviceId: entity.deviceId,
      userAgent: entity.userAgent,
      ipAddress: entity.ipAddress,
      lastUsedIp: entity.lastUsedIp,
      lastUsedUserAgent: entity.lastUsedUserAgent,
    }));
  }

  async markUsed(id: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.repository.update(
      { id },
      { usedAt: new Date(), lastUsedIp: ipAddress, lastUsedUserAgent: userAgent },
    );
  }

  async revokeById(id: string): Promise<void> {
    await this.repository.update({ id }, { isRevoked: true });
  }

  async revokeByUser(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(RefreshTokenEntity)
      .set({ isRevoked: true })
      .where('user_id = :userId', { userId })
      .execute();
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(RefreshTokenEntity)
      .set({ isRevoked: true })
      .where('family_id = :familyId', { familyId })
      .execute();
  }
}

