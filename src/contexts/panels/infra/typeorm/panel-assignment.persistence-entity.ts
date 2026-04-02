import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PanelEntity } from './panel.persistence-entity';
import { GroupEntity } from '../../../groups/infra/typeorm/group.persistence-entity';

@Entity('panel_assignments')
export class PanelAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PanelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'panel_id' })
  panel: PanelEntity;

  @ManyToOne(() => GroupEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;

  @CreateDateColumn()
  assignedAt: Date;
}
