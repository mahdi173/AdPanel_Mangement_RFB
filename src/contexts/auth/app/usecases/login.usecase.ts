import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { USER_REPOSITORY } from "../ports/user.repository";
import type { UserRepository } from "../ports/user.repository";
import { TOKEN_SERVICE } from "../ports/token.service";
import type { TokenService } from "../ports/token.service";
import { PASSWORD_SERVICE } from "../ports/password.service";
import type { PasswordService } from "../ports/password.service";

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
        @Inject(PASSWORD_SERVICE) private readonly passwordService: PasswordService
    ) {}
    
    async execute(email: string, pass: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await this.passwordService.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = await this.tokenService.generateAccessToken(user);
        const refreshToken = await this.tokenService.generateRefreshToken(user);
        
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                permissions: user.permissions
            }
        };
    }
}