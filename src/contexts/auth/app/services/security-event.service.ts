import { Inject, Injectable } from '@nestjs/common';
import {
  SECURITY_EVENT_REPOSITORY,
  SecurityEventLevel,
} from '../ports/security-event.repository';
import type { SecurityEventRepository } from '../ports/security-event.repository';

@Injectable()
export class SecurityEventService {
  constructor(
    @Inject(SECURITY_EVENT_REPOSITORY)
    private readonly securityEventRepository: SecurityEventRepository,
  ) {}

  async log(
    userId: string,
    level: SecurityEventLevel,
    type: string,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.securityEventRepository.create({ userId, level, type, message, metadata });
  }
}

