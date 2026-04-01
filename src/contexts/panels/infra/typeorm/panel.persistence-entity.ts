import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('panels')
export class PanelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  @Column({ default: 'PENDING' })
  status: string;
}
