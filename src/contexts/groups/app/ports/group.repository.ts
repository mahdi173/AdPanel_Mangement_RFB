import { Group } from '../../domain/group.entity';

export interface GroupRepository {
  save(group: Group): Promise<void>;
  findById(id: string): Promise<Group | null>;
  findAll(): Promise<Group[]>;
  addUserToGroup(groupId: string, userId: string): Promise<void>;
}

export const GROUP_REPOSITORY = 'GROUP_REPOSITORY';
