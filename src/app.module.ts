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
    TypeOrmModule.forFeature([UserEntity, PanelEntity]),
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
