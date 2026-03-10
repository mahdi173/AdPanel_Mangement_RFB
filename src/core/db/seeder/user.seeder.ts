import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../contexts/auth/infra/typeorm/user.persistence-entity';
import {
  PASSWORD_SERVICE,
} from '../../../contexts/auth/app/ports/password.service';
import type { PasswordService } from '../../../contexts/auth/app/ports/password.service';

@Injectable()
export class UserSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: PasswordService,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    // Seed regular user
    const userEmail = 'test@example.com';
    const existingUser = await this.userRepository.findOne({
      where: { email: userEmail },
    });

    if (!existingUser) {
      const hashedPassword = await this.passwordService.hash('password123');
      const newUser = this.userRepository.create({
        email: userEmail,
        password: hashedPassword,
        permissions: '00001',
      });
      await this.userRepository.save(newUser);
      console.log('User seeder: Default user created');
    }

    // Seed admin user
    const adminEmail = 'admin@example.com';
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedAdminPassword = await this.passwordService.hash('admin123');
      const newAdmin = this.userRepository.create({
        email: adminEmail,
        password: hashedAdminPassword,
        permissions: '11111',
      });
      await this.userRepository.save(newAdmin);
      console.log('User seeder: Admin user created');
    }
  }
}
