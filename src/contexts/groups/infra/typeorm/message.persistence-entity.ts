import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GroupEntity } from './group.persistence-entity';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  senderEmail: string;

  @Column({ name: 'client_message_id', nullable: true, unique: true })
  clientMessageId: string;

  @ManyToOne(() => GroupEntity, group => group.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;

  @CreateDateColumn()
  createdAt: Date;
}
