import { Controller, Get, UseGuards, Render, Req, Inject, Patch, Param, Body, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { USER_REPOSITORY } from '../app/ports/user.repository';
import type { UserRepository } from '../app/ports/user.repository';
import { PANEL_REPOSITORY } from '../../panels/app/ports/panel.repository';
import type { PanelRepository } from '../../panels/app/ports/panel.repository';
import { GROUP_REPOSITORY } from '../../groups/app/ports/group.repository';
import type { GroupRepository } from '../../groups/app/ports/group.repository';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('11111') 
export class AdminController {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PANEL_REPOSITORY)
    private readonly panelRepository: PanelRepository,
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository
  ) {}

  @Get()
  @Render('admin/dashboard')
  async getAdminHome(@Req() req: any) {
    const users = await this.userRepository.findAll(); 
    const panels = await this.panelRepository.findAll();
    const groups = await this.groupRepository.findAll();
    return { 
      title: 'Admin Dashboard',
      admin: req.user,
      users: users,
      panels: panels,
      groups: groups
    };
  }

  @Patch('users/:id/role')
  async updateRole(
    @Param('id') id: string,
    @Body('permissions') permissions: string
  ) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    
    user.updatePermissions(permissions);
    await this.userRepository.save(user);
    return { success: true };
  }

  @Patch('panels/:id/approve')
  async approvePanel(@Param('id') id: string) {
    const panels = await this.panelRepository.findAll();
    const panel = panels.find(p => p.id === id);
    if (!panel) throw new NotFoundException('Panel not found');
    
    panel.status = 'APPROVED';
    await this.panelRepository.save(panel);
    return { success: true };
  }
}
