import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('processed_events')
export class ProcessedEventEntity {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  processedAt: Date;
}
