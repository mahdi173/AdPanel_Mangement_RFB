import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeController } from '../api/payment.controller';
import { StripeService } from '../app/service/payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../auth/infra/typeorm/user.persistence-entity';

@Module({})
export class StripeModule {
  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      controllers: [StripeController],
      imports: [
        TypeOrmModule.forFeature([UserEntity]),
        ConfigModule.forRoot(),
      ],
      providers: [
        StripeService,
        {
          provide: 'STRIPE_API_KEY',
            useFactory: (configService: ConfigService) =>
            configService.get('STRIPE_API_KEY'),
          inject: [ConfigService],
        },
        {
          provide: 'STRIPE_WEBHOOK_SECRET',
          useFactory: (configService: ConfigService) =>
            configService.get('STRIPE_WEBHOOK_SECRET'),
          inject: [ConfigService],
        },
      ],
      exports: [StripeService],
    };
  }
}