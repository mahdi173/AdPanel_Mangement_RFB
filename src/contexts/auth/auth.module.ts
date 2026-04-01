import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { LoginUseCase } from "./app/usecases/login.usecase";
import { RegisterUseCase } from "./app/usecases/register.usecase";
import { AuthController } from "./api/authController";
import { AdminController } from "./api/admin.controller";
import { TOKEN_SERVICE } from "./app/ports/token.service";
import { USER_REPOSITORY } from "./app/ports/user.repository";
import { PASSWORD_SERVICE } from "./app/ports/password.service";
import { BcryptPasswordService } from "./infra/bcrypt-password.service";

import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./infra/typeorm/user.persistence-entity";
import { TypeOrmUserRepository } from "./infra/typeorm-user.repository";
import { JwtTokenService } from "./infra/jwt-token.service";
import { JwtStrategy } from "./infra/jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { PanelsModule } from "../panels/panels.module";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([UserEntity]),
    PanelsModule,
  ],
  controllers: [AuthController, AdminController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    JwtStrategy,
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: PASSWORD_SERVICE,
      useClass: BcryptPasswordService,
    },
  ],
  exports: [LoginUseCase, RegisterUseCase, PASSWORD_SERVICE],
})
export class AuthModule {}