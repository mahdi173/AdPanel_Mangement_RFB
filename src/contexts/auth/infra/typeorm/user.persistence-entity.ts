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

  @Column({ nullable: true, name: 'stripe_customer_id' })
  stripeCustomerId: string;

  @Column({ nullable: true, name: 'subscription_id' })
  subscriptionId: string;

  @Column({ nullable: true, name: 'subscription_status' })
  subscriptionStatus: string;

  @ManyToMany(() => GroupEntity, group => group.users)
  groups: GroupEntity[];
}
