import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../contexts/auth/infra/typeorm/user.persistence-entity';
import { PanelEntity } from '../../../contexts/panels/infra/typeorm/panel.persistence-entity';
import { GroupEntity } from '../../../contexts/groups/infra/typeorm/group.persistence-entity';
import {
  PASSWORD_SERVICE,
} from '../../../contexts/auth/app/ports/password.service';
import type { PasswordService } from '../../../contexts/auth/app/ports/password.service';

@Injectable()
export class UserSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PanelEntity)
    private readonly panelRepository: Repository<PanelEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
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

    // Seed panels
    const panelCount = await this.panelRepository.count();
    if (panelCount < 15) {
      for (let i = 1; i <= 15; i++) {
        const isFilled = i <= 12; // 12 occupied panels, so non-admin sees 10 max
        await this.panelRepository.save({
          name: `Sample Panel ${i}`,
          latitude: 33.5 + (Math.random() * 0.1),
          longitude: -7.6 + (Math.random() * 0.1),
          status: 'APPROVED',
          isFilled,
        });
      }
      console.log('Panel seeder: Panels created');
    }

    // Seed groups
    const groupCount = await this.groupRepository.count();
    if (groupCount === 0 && existingAdmin) {
      const g = this.groupRepository.create({
        name: 'Alpha Workers',
      });
      await this.groupRepository.save(g);
      console.log('Group seeder: Group created');
    }
  }
}
