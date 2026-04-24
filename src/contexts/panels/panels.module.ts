import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PanelController } from './api/panel.controller';
import { PANEL_REPOSITORY } from './app/ports/panel.repository';
import { TypeOrmPanelRepository } from './infra/typeorm-panel.repository';
import { CachedPanelRepository } from './infra/cached-panel.repository';
import { PanelEntity } from './infra/typeorm/panel.persistence-entity';
import { PanelAssignmentEntity } from './infra/typeorm/panel-assignment.persistence-entity';
import { GroupEntity } from '../groups/infra/typeorm/group.persistence-entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PanelEntity, PanelAssignmentEntity, GroupEntity]), forwardRef(() => AuthModule)],
  controllers: [PanelController],
  providers: [
    TypeOrmPanelRepository,
    {
      provide: PANEL_REPOSITORY,
      useClass: CachedPanelRepository,
    },
  ],
  exports: [PANEL_REPOSITORY],
})
export class PanelsModule {}
