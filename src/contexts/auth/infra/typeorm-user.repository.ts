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

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { email } });
    if (!userEntity) return null;
    return new User(userEntity.id, userEntity.email, userEntity.password);
  }

  async save(user: User): Promise<void> {
    const userEntity = this.repository.create({
      id: user.id || undefined,
      email: user.email,
      password: user.password,
    });
    await this.repository.save(userEntity);
  }
}
