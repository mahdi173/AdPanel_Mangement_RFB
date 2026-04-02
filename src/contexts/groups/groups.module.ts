import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './infra/typeorm/group.persistence-entity';
import { MessageEntity } from './infra/typeorm/message.persistence-entity';
import { UserEntity } from '../auth/infra/typeorm/user.persistence-entity';
import { TypeOrmGroupRepository } from './infra/typeorm-group.repository';
import { GROUP_REPOSITORY } from './app/ports/group.repository';
import { GroupController } from './api/group.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEntity, UserEntity, MessageEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [GroupController],
  providers: [
    {
      provide: GROUP_REPOSITORY,
      useClass: TypeOrmGroupRepository,
    },
  ],
  exports: [GROUP_REPOSITORY]
})
export class GroupsModule {}
