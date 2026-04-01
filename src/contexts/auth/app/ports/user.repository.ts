import { User } from '../../domain/user.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<void>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
