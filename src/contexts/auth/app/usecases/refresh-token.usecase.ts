import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { USER_REPOSITORY } from "../ports/user.repository";
import type { UserRepository } from "../ports/user.repository";
import { TOKEN_SERVICE } from "../ports/token.service";
import type { TokenService } from "../ports/token.service";

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService
    ) {}
    
    async execute(refreshToken: string) {
        try {
            const payload = await this.tokenService.verifyRefreshToken(refreshToken);
            
            const user = await this.userRepository.findById(payload.sub);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const accessToken = await this.tokenService.generateAccessToken(user);
            const newRefreshToken = await this.tokenService.generateRefreshToken(user);

            return {
                access_token: accessToken,
                refresh_token: newRefreshToken
            };
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }
}
