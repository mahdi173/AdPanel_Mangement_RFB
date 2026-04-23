import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { USER_REPOSITORY } from "../ports/user.repository";
import type { UserRepository } from "../ports/user.repository";
import { TOKEN_SERVICE } from "../ports/token.service";
import type { TokenService } from "../ports/token.service";
import { PASSWORD_SERVICE } from "../ports/password.service";
import type { PasswordService } from "../ports/password.service";
import { REFRESH_TOKEN_REPOSITORY } from "../ports/refresh-token.repository";
import type { RefreshTokenRepository } from "../ports/refresh-token.repository";
import type { RequestAuthContext } from "../../api/request-auth-context";
import * as crypto from 'crypto';
import { SecurityEventService } from "../services/security-event.service";

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
        @Inject(PASSWORD_SERVICE) private readonly passwordService: PasswordService,
        @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly securityEventService: SecurityEventService,
    ) {}
    
    async execute(email: string, pass: string, context: RequestAuthContext) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await this.passwordService.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const refreshTokenId = crypto.randomUUID();
        const familyId = crypto.randomUUID();
        const version = 1;
        const refreshClaims = {
            id: refreshTokenId,
            familyId,
            isRevoked: false,
            version,
        };

        const accessToken = await this.tokenService.generateAccessToken(user, refreshClaims);
        const refreshToken = await this.tokenService.generateRefreshToken(user, refreshClaims);
        await this.refreshTokenRepository.create({
            id: refreshTokenId,
            userId: user.id,
            familyId,
            version,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            deviceId: context.deviceId,
            userAgent: context.userAgent,
            ipAddress: context.ipAddress,
        });
        await this.securityEventService.log(
            user.id,
            'low',
            'login-success',
            'Successful login',
            { deviceId: context.deviceId, ipAddress: context.ipAddress, userAgent: context.userAgent }
        );
        
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