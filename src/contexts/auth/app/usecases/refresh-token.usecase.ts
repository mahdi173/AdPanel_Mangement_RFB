import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { USER_REPOSITORY } from "../ports/user.repository";
import type { UserRepository } from "../ports/user.repository";
import { TOKEN_SERVICE } from "../ports/token.service";
import type { TokenService } from "../ports/token.service";
import { REFRESH_TOKEN_REPOSITORY } from "../ports/refresh-token.repository";
import type { RefreshTokenRepository } from "../ports/refresh-token.repository";
import type { RequestAuthContext } from "../../api/request-auth-context";
import { RefreshTokenRiskService } from "../services/refresh-token-risk.service";
import * as crypto from 'crypto';
import { SecurityEventService } from "../services/security-event.service";

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
        @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly riskService: RefreshTokenRiskService,
        private readonly securityEventService: SecurityEventService,
    ) {}
    
    async execute(refreshToken: string, context: RequestAuthContext) {
        try {
            const payload = await this.tokenService.verifyRefreshToken(refreshToken);
            const storedToken = await this.refreshTokenRepository.findById(payload.id);
            if (!storedToken) {
                throw new UnauthorizedException('Refresh token not found');
            }

            if (storedToken.userId !== payload.sub) {
                await this.refreshTokenRepository.revokeById(storedToken.id);
                throw new UnauthorizedException('Token subject mismatch');
            }

            if ((payload.version ?? 0) !== storedToken.version) {
                await this.refreshTokenRepository.revokeFamily(storedToken.familyId);
                throw new UnauthorizedException('Refresh token version mismatch');
            }

            if (payload.isRevoked) {
                await this.refreshTokenRepository.revokeFamily(storedToken.familyId);
                throw new UnauthorizedException('Refresh token has been revoked');
            }

            const risk = this.riskService.assess(storedToken, {
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                deviceId: context.deviceId,
            });
            if (risk.level === 'high') {
                await this.refreshTokenRepository.revokeFamily(storedToken.familyId);
                await this.securityEventService.log(
                    payload.sub,
                    'high',
                    'refresh-blocked',
                    'High risk refresh attempt blocked',
                    { reasons: risk.reasons, tokenId: storedToken.id }
                );
                throw new UnauthorizedException('High risk refresh attempt blocked');
            }
            await this.riskService.handle(risk.level, payload.sub, risk.reasons);

            // One-time refresh token rotation: old token becomes unusable.
            await this.refreshTokenRepository.markUsed(storedToken.id, context.ipAddress, context.userAgent);
            await this.refreshTokenRepository.revokeById(storedToken.id);
            
            const user = await this.userRepository.findById(payload.sub);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const newRefreshId = crypto.randomUUID();
            const nextVersion = storedToken.version + 1;
            const claims = {
                id: newRefreshId,
                familyId: storedToken.familyId,
                parentId: storedToken.id,
                isRevoked: false,
                version: nextVersion,
            };

            const accessToken = await this.tokenService.generateAccessToken(user, claims);
            const newRefreshToken = await this.tokenService.generateRefreshToken(user, claims);
            await this.refreshTokenRepository.create({
                id: newRefreshId,
                userId: user.id,
                familyId: storedToken.familyId,
                parentId: storedToken.id,
                version: nextVersion,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                deviceId: storedToken.deviceId,
                userAgent: context.userAgent,
                ipAddress: context.ipAddress,
            });
            await this.securityEventService.log(
                user.id,
                'low',
                'refresh-success',
                'Refresh token rotated successfully',
                { previousTokenId: storedToken.id, newTokenId: newRefreshId, deviceId: storedToken.deviceId }
            );

            return {
                access_token: accessToken,
                refresh_token: newRefreshToken
            };
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }
}
