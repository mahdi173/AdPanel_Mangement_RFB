import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { GroupEntity } from '../../../groups/infra/typeorm/group.persistence-entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: '00001' })
  permissions: string;

  @ManyToMany(() => GroupEntity, group => group.users)
  groups: GroupEntity[];
}
