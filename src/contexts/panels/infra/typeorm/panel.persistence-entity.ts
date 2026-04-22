import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, VersionColumn } from 'typeorm';

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

  @Column({ default: false })
  isFilled: boolean;

  @VersionColumn({ default: 1 }) // Optimistic lock
  version: number;

  @CreateDateColumn()
  createdAt: Date;
}
