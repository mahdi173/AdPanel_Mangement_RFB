import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PanelRepository } from '../app/ports/panel.repository';
import { Panel } from '../domain/panel.entity';
import { PanelEntity } from './typeorm/panel.persistence-entity';

@Injectable()
export class TypeOrmPanelRepository implements PanelRepository {
  constructor(
    @InjectRepository(PanelEntity)
    private readonly repository: Repository<PanelEntity>,
  ) {}

  async findAll(): Promise<Panel[]> {
    const entities = await this.repository.find();
    return entities.map(entity => new Panel(
      entity.id,
      entity.name,
      Number(entity.latitude),
      Number(entity.longitude),
      entity.status as 'PENDING' | 'APPROVED',
    ));
  }

  async save(panel: Panel): Promise<void> {
    const panelEntity = this.repository.create({
      id: panel.id || undefined,
      name: panel.name,
      latitude: panel.latitude,
      longitude: panel.longitude,
      status: panel.status,
    });
    await this.repository.save(panelEntity);
  }
}
