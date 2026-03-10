import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { LoginUseCase } from "./app/usecases/login.usecase";
import { AuthController } from "./api/authController";
import { TOKEN_SERVICE } from "./app/ports/token.service";
import { USER_REPOSITORY } from "./app/ports/user.repository";
import { PASSWORD_SERVICE } from "./app/ports/password.service";
import { BcryptPasswordService } from "./infra/bcrypt-password.service";

import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./infra/typeorm/user.persistence-entity";
import { TypeOrmUserRepository } from "./infra/typeorm-user.repository";
import { JwtTokenService } from "./infra/jwt-token.service";

@Module({
    imports: [
        JwtModule.register({
            secret: 'secretKey',
            signOptions: { expiresIn: '1h' },
        }),
        TypeOrmModule.forFeature([UserEntity]),
    ],
    controllers: [AuthController],
    providers: [
        LoginUseCase,
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
    exports: [LoginUseCase]
})
export class AuthModule {}