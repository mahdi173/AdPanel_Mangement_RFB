import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PanelController } from './api/panel.controller';
import { PANEL_REPOSITORY } from './app/ports/panel.repository';
import { TypeOrmPanelRepository } from './infra/typeorm-panel.repository';
import { PanelEntity } from './infra/typeorm/panel.persistence-entity';

@Module({
  imports: [TypeOrmModule.forFeature([PanelEntity])],
  controllers: [PanelController],
  providers: [
    {
      provide: PANEL_REPOSITORY,
      useClass: TypeOrmPanelRepository,
    },
  ],
  exports: [PANEL_REPOSITORY],
})
export class PanelsModule {}
