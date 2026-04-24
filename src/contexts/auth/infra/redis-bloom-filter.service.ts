import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { createHash } from 'crypto';
import { BloomFilterPort } from '../app/ports/bloom-filter.port';

@Injectable()
export class RedisBloomFilterService implements BloomFilterPort {
  private readonly redis: Redis;
  private readonly key = 'bloom:emails';
  private readonly size = 1000000; // 1M bits (approx 125KB)
  private readonly numHashes = 5;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  async add(value: string): Promise<void> {
    const indices = this.getIndices(value);
    const pipeline = this.redis.pipeline();
    for (const index of indices) {
      pipeline.setbit(this.key, index, 1);
    }
    await pipeline.exec();
  }

  async mightExist(value: string): Promise<boolean> {
    const indices = this.getIndices(value);
    const pipeline = this.redis.pipeline();
    for (const index of indices) {
      pipeline.getbit(this.key, index);
    }
    const results = await pipeline.exec();
    if (!results) return false;
    
    // Every bit must be 1 for the value to "possibly" exist
    return results.every(([err, val]) => !err && val === 1);
  }

  private getIndices(value: string): number[] {
    const indices: number[] = [];
    const normalizedValue = value.toLowerCase().trim();
    
    for (let i = 0; i < this.numHashes; i++) {
      const hash = createHash('sha256')
        .update(`${i}:${normalizedValue}`)
        .digest();
      
      // Use the first 4 bytes as a 32-bit unsigned integer
      const index = hash.readUInt32BE(0) % this.size;
      indices.push(index);
    }
    return indices;
  }
}
