import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './contexts/auth/auth.module';
import { PanelsModule } from './contexts/panels/panels.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './contexts/auth/infra/typeorm/user.persistence-entity';
import { PanelEntity } from './contexts/panels/infra/typeorm/panel.persistence-entity';
import { UserSeeder } from './core/db/seeder/user.seeder';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './core/filters/not-found.filter';
import { GroupsModule } from './contexts/groups/groups.module';
import { NotificationsModule } from './core/notifications/notifications.module';
import { GroupEntity } from './contexts/groups/infra/typeorm/group.persistence-entity';
import { MessageEntity } from './contexts/groups/infra/typeorm/message.persistence-entity';
import { StripeModule } from './contexts/payment/infra/payment.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'rf_db',
      autoLoadEntities: true,
      synchronize: true, // Auto-create tables in dev environment
    }),
    AuthModule,
    PanelsModule,
    GroupsModule,
    NotificationsModule,
    TypeOrmModule.forFeature([UserEntity, PanelEntity, GroupEntity, MessageEntity]),
    StripeModule.forRootAsync(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        stores: [
          new Keyv({
            store: new KeyvRedis(`redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`),
            ttl: parseInt(process.env.REDIS_TTL || '3600') * 1000,
          }),
        ],
      }),
    }),
  ],

  controllers: [AppController],
  providers: [
    AppService,
    UserSeeder,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
