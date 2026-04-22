import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PanelRepository } from '../app/ports/panel.repository';
import { Panel } from '../domain/panel.entity';
import { PanelEntity } from './typeorm/panel.persistence-entity';
import { PanelAssignmentEntity } from './typeorm/panel-assignment.persistence-entity';
import { GroupEntity } from '../../groups/infra/typeorm/group.persistence-entity';

@Injectable()
export class TypeOrmPanelRepository implements PanelRepository {
  constructor(
    @InjectRepository(PanelEntity)
    private readonly repository: Repository<PanelEntity>,
    @InjectRepository(PanelAssignmentEntity)
    private readonly assignmentRepository: Repository<PanelAssignmentEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  async findAll(): Promise<Panel[]> {
    const entities = await this.repository.find();
    return entities.map(entity => new Panel(
      entity.id,
      entity.name,
      Number(entity.latitude),
      Number(entity.longitude),
      entity.status as 'PENDING' | 'APPROVED',
      entity.isFilled,
      entity.createdAt,
    ));
  }

  async findById(id: string): Promise<Panel | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return new Panel(
      entity.id,
      entity.name,
      Number(entity.latitude),
      Number(entity.longitude),
      entity.status as 'PENDING' | 'APPROVED',
      entity.isFilled,
      entity.createdAt,
    );
  }

  async getRecentOccupied(limit: number): Promise<Panel[]> {
    const entities = await this.repository.find({
      where: { isFilled: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return entities.map(entity => new Panel(
      entity.id,
      entity.name,
      Number(entity.latitude),
      Number(entity.longitude),
      entity.status as 'PENDING' | 'APPROVED',
      entity.isFilled,
      entity.createdAt,
    ));
  }

  async save(panel: Panel): Promise<void> {
    const panelEntity = this.repository.create({
      id: panel.id || undefined,
      name: panel.name,
      latitude: panel.latitude,
      longitude: panel.longitude,
      status: panel.status,
      isFilled: panel.isFilled,
      createdAt: panel.createdAt,
    });
    await this.repository.save(panelEntity);
  }

  async assignPanelToGroup(panelId: string, groupId: string): Promise<void> {
    await this.repository.manager.transaction(async (transactionalEntityManager) => {
      const panel = await transactionalEntityManager.findOne(PanelEntity, { 
        where: { id: panelId },
        lock: { mode: 'pessimistic_write' }
      });
      const group = await transactionalEntityManager.findOne(GroupEntity, { where: { id: groupId } });
      
      if (panel && group) {
        const existing = await transactionalEntityManager.findOne(PanelAssignmentEntity, { 
          where: { panel: { id: panelId }, group: { id: groupId } } 
        });
        if (!existing) {
          const assignment = transactionalEntityManager.create(PanelAssignmentEntity, {
            panel,
            group,
          });
          await transactionalEntityManager.save(assignment);
        }
      }
    });
  }
}
