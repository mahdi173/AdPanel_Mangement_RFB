import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../app/ports/user.repository';
import { User } from '../domain/user.entity';
import { UserEntity } from './typeorm/user.persistence-entity';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<User| null> {
    const userEntity = await this.repository.findOne({ where: { email } });
    return this.mapToDomain(userEntity);
  }

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { id } });
    return this.mapToDomain(userEntity);
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repository.find();
    return entities.map(entity => this.mapToDomain(entity)!);
  }

  async save(user: User): Promise<void> {
    // Using save() on an object with an ID will update if it exists
    const userEntity = this.repository.create({
      id: user.id || undefined,
      email: user.email,
      password: user.password,
      permissions: user.permissions,
      stripeCustomerId: user.stripeCustomerId,
      subscriptionId: user.subscriptionId,
      subscriptionStatus: user.subscriptionStatus,
    });
    await this.repository.save(userEntity);
  }

  private mapToDomain(entity: UserEntity | null): User | null {
    if (!entity) return null;
    return new User(
      entity.id,
      entity.email,
      entity.password,
      entity.permissions,
      entity.stripeCustomerId,
      entity.subscriptionId,
      entity.subscriptionStatus,
    );
  }
}
