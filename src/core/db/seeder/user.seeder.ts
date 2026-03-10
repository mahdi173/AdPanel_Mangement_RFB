import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../contexts/auth/infra/typeorm/user.persistence-entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const email = 'test@example.com';
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
      });
      await this.userRepository.save(newUser);
      console.log('User seeder: Default user created');
    } else {
      console.log('User seeder: Default user already exists');
    }
  }
}
