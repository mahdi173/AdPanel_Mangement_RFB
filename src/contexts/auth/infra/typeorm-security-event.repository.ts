import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateSecurityEventInput,
  SecurityEventLevel,
  SecurityEventRecord,
  SecurityEventRepository,
} from '../app/ports/security-event.repository';
import { SecurityEventEntity } from './typeorm/security-event.persistence-entity';

@Injectable()
export class TypeOrmSecurityEventRepository implements SecurityEventRepository {
  constructor(
    @InjectRepository(SecurityEventEntity)
    private readonly repository: Repository<SecurityEventEntity>,
  ) {}

  async create(input: CreateSecurityEventInput): Promise<void> {
    const entity = this.repository.create(input);
    await this.repository.save(entity);
  }

  async listByUser(userId: string, limit = 100): Promise<SecurityEventRecord[]> {
    const rows = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      level: r.level as SecurityEventLevel,
      type: r.type,
      message: r.message,
      metadata: r.metadata,
      createdAt: r.createdAt,
      isRead: r.isRead,
    }));
  }

  async listAlertsByUser(userId: string, limit = 50): Promise<SecurityEventRecord[]> {
    const rows = await this.repository
      .createQueryBuilder('event')
      .where('event.user_id = :userId', { userId })
      .andWhere('event.level IN (:...levels)', { levels: ['middle', 'high'] })
      .orderBy('event.created_at', 'DESC')
      .take(limit)
      .getMany();
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      level: r.level as SecurityEventLevel,
      type: r.type,
      message: r.message,
      metadata: r.metadata,
      createdAt: r.createdAt,
      isRead: r.isRead,
    }));
  }

  async listAll(limit = 200): Promise<SecurityEventRecord[]> {
    const rows = await this.repository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      level: r.level as SecurityEventLevel,
      type: r.type,
      message: r.message,
      metadata: r.metadata,
      createdAt: r.createdAt,
      isRead: r.isRead,
    }));
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(SecurityEventEntity)
      .set({ isRead: true })
      .where('user_id = :userId', { userId })
      .execute();
  }
}

