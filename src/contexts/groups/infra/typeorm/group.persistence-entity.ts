import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { UserEntity } from '../../../auth/infra/typeorm/user.persistence-entity';
import { MessageEntity } from './message.persistence-entity';

@Entity('groups')
export class GroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => UserEntity, { eager: true, cascade: false })
  @JoinTable({
    name: 'group_users',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: UserEntity[];

  @OneToMany(() => MessageEntity, message => message.group)
  messages: MessageEntity[];
}
