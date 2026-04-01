import { Controller, Get, Post, Body, UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PANEL_REPOSITORY } from '../app/ports/panel.repository';
import type { PanelRepository } from '../app/ports/panel.repository';
import { Panel } from '../domain/panel.entity';

@Controller('panels')
export class PanelController {
  constructor(
    @Inject(PANEL_REPOSITORY)
    private readonly panelRepository: PanelRepository,
  ) {}

  @Get()
  async getAll() {
    return this.panelRepository.findAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() body: { name: string; lat: number; lng: number }) {
    const panel = new Panel(null, body.name, body.lat, body.lng);
    await this.panelRepository.save(panel);
    return { success: true };
  }
}
