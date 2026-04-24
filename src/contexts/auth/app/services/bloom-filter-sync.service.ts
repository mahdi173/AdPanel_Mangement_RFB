import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { USER_REPOSITORY } from '../ports/user.repository';
import type { UserRepository } from '../ports/user.repository';
import { BLOOM_FILTER_PORT } from '../ports/bloom-filter.port';
import type { BloomFilterPort } from '../ports/bloom-filter.port';
import { Redis } from 'ioredis';

@Injectable()
export class BloomFilterSyncService implements OnModuleInit {
  private readonly logger = new Logger(BloomFilterSyncService.name);
  private readonly SYNC_KEY = 'bloom:emails:synced';

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(BLOOM_FILTER_PORT) private readonly bloomFilter: BloomFilterPort,
  ) {}

  async onModuleInit() {
    await this.sync();
  }

  async sync() {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    try {
      const isSynced = await redis.get(this.SYNC_KEY);
      if (isSynced) {
        this.logger.log('Bloom Filter already synchronized.');
        return;
      }

      this.logger.log('Synchronizing Bloom Filter with existing users...');
      const users = await this.userRepository.findAll();
      
      for (const user of users) {
        await this.bloomFilter.add(user.email);
      }

      await redis.set(this.SYNC_KEY, 'true');
      this.logger.log(`Bloom Filter synchronized with ${users.length} users.`);
    } catch (error) {
      this.logger.error('Failed to synchronize Bloom Filter', error);
    } finally {
      redis.disconnect();
    }
  }
}
