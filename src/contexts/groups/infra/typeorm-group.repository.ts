import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupRepository } from '../app/ports/group.repository';
import { Group } from '../domain/group.entity';
import { GroupEntity } from './typeorm/group.persistence-entity';
import { UserEntity } from '../../auth/infra/typeorm/user.persistence-entity';

@Injectable()
export class TypeOrmGroupRepository implements GroupRepository {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly repository: Repository<GroupEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<Group[]> {
    const entities = await this.repository.find({ relations: ['users'] });
    return entities.map(entity => new Group(
      entity.id,
      entity.name,
      entity.users?.map(u => ({ id: u.id, email: u.email })) || []
    ));
  }

  async findById(id: string): Promise<Group | null> {
    const entity = await this.repository.findOne({ where: { id }, relations: ['users'] });
    if (!entity) return null;
    return new Group(
      entity.id,
      entity.name,
      entity.users?.map(u => ({ id: u.id, email: u.email })) || []
    );
  }

  async save(group: Group): Promise<void> {
    const groupEntity = this.repository.create({
      id: group.id || undefined,
      name: group.name,
    });
    await this.repository.save(groupEntity);
  }

  async addUserToGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.repository.findOne({ where: { id: groupId }, relations: ['users'] });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (group && user) {
      if (!group.users) group.users = [];
      if (!group.users.find(u => u.id === userId)) {
        group.users.push(user);
        await this.repository.save(group);
      }
    }
  }
}
