import { Controller, Get, Post, Body, UseGuards, Inject, Param, Req, Logger } from '@nestjs/common';
import { OptimisticLockVersionMismatchError } from 'typeorm';
import { OptionalJwtAuthGuard } from '../../auth/api/optional-jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { PANEL_REPOSITORY } from '../app/ports/panel.repository';
import type { PanelRepository } from '../app/ports/panel.repository';
import { Panel } from '../domain/panel.entity';
import { NotificationsService } from '../../../core/notifications/notifications.service';
import { RolesGuard } from '../../auth/api/roles.guard';
import { Roles } from '../../auth/api/roles.decorator';

@Controller('panels')
export class PanelController {
  private readonly logger = new Logger(PanelController.name);

  constructor(
    @Inject(PANEL_REPOSITORY)
    private readonly panelRepository: PanelRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getAll(@Req() req: any) {
    if (!req.user) return [];
    if (req.user.permissions === '11111') {
      return this.panelRepository.findAll();
    }
    return this.panelRepository.getRecentOccupied(10);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() body: { name: string; lat: number; lng: number }) {
    const panel = new Panel(null, body.name, body.lat, body.lng);
    await this.panelRepository.save(panel);
    return { success: true };
  }

  @Post(':id/share')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('11111') // Admin only
  async sharePanel(@Body('groupId') groupId: string, @Param('id') id: string) {
    await this.panelRepository.assignPanelToGroup(id, groupId);
    this.notificationsService.notifyPanelShared([groupId], { panelId: id });
    return { success: true };
  }

  @Post(':id/status')
  @UseGuards(AuthGuard('jwt')) 
  async updateStatus(@Param('id') id: string, @Body('isFilled') isFilled: boolean) {
    const panel = await this.panelRepository.findById(id);
    if (!panel) return { success: false, error: 'Panel not found' };
    
    try {
      panel.isFilled = isFilled;
      await this.panelRepository.save(panel);
      this.notificationsService.notifyPanelStatusUpdated({ panelId: id, isFilled });
      return { success: true };
    } catch (error) {
      if (error instanceof OptimisticLockVersionMismatchError) {
        this.logger.warn(`Optimistic lock conflict for panel ${id}. User was trying to set isFilled to ${isFilled}.`);
        return { success: false, conflict: true, error: 'Ce panneau a été modifié par un autre utilisateur. Version obsolète.' };
      }
      this.logger.error(`Failed to update panel status for ${id}`, error.stack);
      return { success: false, error: 'Erreur lors de la mise à jour.' };
    }
  }
}
