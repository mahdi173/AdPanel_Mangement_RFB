import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  notifyPanelShared(userIds: string[], panelInfo: any) {
    userIds.forEach(userId => {
      this.gateway.sendNotificationToRoom(`user_${userId}`, 'panelShared', panelInfo);
    });
  }

  notifyPanelStatusUpdated(panelInfo: any) {
    // Admins could join an 'admin' room
    this.gateway.sendNotificationToRoom('admin', 'panelStatusUpdated', panelInfo);
  }

  notifyNewChatMessage(groupId: string, message: any) {
    this.gateway.sendNotificationToRoom(`group_${groupId}`, 'groupChat', message);
    this.gateway.sendNotificationToRoom('admin', 'groupChat', message);
  }

  notifySecurityAlert(payload: { level: 'middle' | 'high'; userId: string; reasons: string[] }) {
    this.gateway.sendNotificationToRoom('admin', 'securityAlert', payload);
  }
}
