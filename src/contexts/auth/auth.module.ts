import { Module, forwardRef, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { LoginUseCase } from "./app/usecases/login.usecase";
import { RegisterUseCase } from "./app/usecases/register.usecase";
import { RefreshTokenUseCase } from "./app/usecases/refresh-token.usecase";
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
import { PanelsModule } from "../panels/panels.module";
import { GroupsModule } from "../groups/groups.module";
import { AuthMiddleware } from "./api/auth.middleware";
import { JwtAuthGuard } from "./api/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "./api/optional-jwt-auth.guard";
import { RolesGuard } from "./api/roles.guard";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PanelsModule,
    forwardRef(() => GroupsModule),
  ],
  controllers: [AuthController, AdminController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    RolesGuard,
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
  exports: [
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    PASSWORD_SERVICE,
    USER_REPOSITORY,
    TOKEN_SERVICE,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}