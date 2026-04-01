import { Controller, Get, Render, Req, UseGuards, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { OptionalJwtAuthGuard } from './contexts/auth/api/optional-jwt-auth.guard';
import { PANEL_REPOSITORY } from './contexts/panels/app/ports/panel.repository';
import type { PanelRepository } from './contexts/panels/app/ports/panel.repository';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(PANEL_REPOSITORY)
    private readonly panelRepository: PanelRepository
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @Render('home')
  async getHome(@Req() req: any) {
    // Note: req.user will be populated only if we use a guard that allows optional auth
    // For now, let's just fetch panels
    const panels = await this.panelRepository.findAll();
    return {
      title: 'Home',
      user: req.user,
      panels: panels
    };
  }

  @Get('login.html') // Support old link
  @Render('login')
  getLoginOld() {
    return { title: 'Login' };
  }

  @Get('login')
  @Render('login')
  getLogin() {
    return { title: 'Login' };
  }
}
