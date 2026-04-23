import { Injectable, Logger } from '@nestjs/common';
import type { RefreshTokenRecord } from '../ports/refresh-token.repository';
import { NotificationsService } from '../../../../core/notifications/notifications.service';
import { SecurityEventService } from './security-event.service';

type RiskLevel = 'high' | 'middle' | 'low' | 'none';

export interface RefreshRequestContext {
  ipAddress?: string;
  userAgent?: string;
  deviceId: string;
}

@Injectable()
export class RefreshTokenRiskService {
  private readonly logger = new Logger(RefreshTokenRiskService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly securityEventService: SecurityEventService,
  ) {}

  assess(record: RefreshTokenRecord, ctx: RefreshRequestContext): { level: RiskLevel; reasons: string[] } {
    const reasons: string[] = [];
    let level: RiskLevel = 'none';

    if (record.isRevoked) {
      reasons.push('refresh-token-revoked');
      return { level: 'high', reasons };
    }

    if (record.usedAt) {
      reasons.push('refresh-token-reuse-detected');
      return { level: 'high', reasons };
    }

    if (record.deviceId !== ctx.deviceId) {
      reasons.push('device-mismatch');
      return { level: 'high', reasons };
    }

    if (record.lastUsedIp && ctx.ipAddress && record.lastUsedIp !== ctx.ipAddress) {
      reasons.push('ip-changed');
      level = 'middle';
    }

    if (!ctx.userAgent || ctx.userAgent.length < 12) {
      reasons.push('weak-user-agent-pattern');
      if (level === 'none') level = 'low';
    }

    return { level, reasons };
  }

  async handle(level: RiskLevel, userId: string, reasons: string[]): Promise<void> {
    if (level === 'high') return;
    if (level === 'middle') {
      this.notificationsService.notifySecurityAlert({
        level,
        userId,
        reasons,
      });
      await this.securityEventService.log(
        userId,
        'middle',
        'refresh-risk-alert',
        'Refresh token used from unusual context',
        { reasons },
      );
      return;
    }
    if (level === 'low') {
      this.logger.warn(`Low risk refresh activity detected for user=${userId}: ${reasons.join(',')}`);
      await this.securityEventService.log(
        userId,
        'low',
        'refresh-risk-log',
        'Suspicious refresh pattern detected',
        { reasons },
      );
    }
  }
}

