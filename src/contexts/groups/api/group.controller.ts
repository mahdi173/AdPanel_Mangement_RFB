import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GROUP_REPOSITORY } from '../app/ports/group.repository';
import type { GroupRepository } from '../app/ports/group.repository';
import { Group } from '../domain/group.entity';
import { RolesGuard } from '../../auth/api/roles.guard';
import { Roles } from '../../auth/api/roles.decorator';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../infra/typeorm/message.persistence-entity';
import { NotificationsService } from '../../../core/notifications/notifications.service';

@Controller('groups')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GroupController {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  @Roles('11111')
  async createGroup(@Body() body: { name: string }) {
    const group = new Group(null, body.name);
    await this.groupRepository.save(group);
    return { success: true };
  }

  @Get()
  @Roles('11111')
  async getGroups() {
    return this.groupRepository.findAll();
  }

  @Post(':id/users')
  @Roles('11111')
  async addUserToGroup(@Param('id') groupId: string, @Body() body: { userId: string }) {
    await this.groupRepository.addUserToGroup(groupId, body.userId);
    return { success: true };
  }

  @Get(':id/messages')
  async getGroupMessages(@Param('id') groupId: string) {
    return this.messageRepository.find({
      where: { group: { id: groupId } },
      order: { createdAt: 'ASC' }
    });
  }

  @Post(':id/messages')
  async sendMessage(@Param('id') groupId: string, @Body() body: { content: string, clientMessageId?: string }, @Req() req: any) {
    const senderEmail = req.user.email;
    const clientMessageId = body.clientMessageId;

    if (clientMessageId) {
      const existing = await this.messageRepository.findOneBy({ clientMessageId });
      if (existing) {
        return { success: true, message: existing, duplicated: true };
      }
    }
    
    const message = this.messageRepository.create({
      content: body.content,
      senderEmail: senderEmail,
      clientMessageId: clientMessageId,
      group: { id: groupId } as any
    });
    await this.messageRepository.save(message);

    this.notificationsService.notifyNewChatMessage(groupId, message);

    return { success: true, message };
  }
}
