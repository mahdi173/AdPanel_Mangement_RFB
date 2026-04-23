import { Controller, Post, Body, Get, Res, Req, UseGuards, Inject, UnauthorizedException } from "@nestjs/common";
import { LoginUseCase } from "../app/usecases/login.usecase";
import { RegisterUseCase } from "../app/usecases/register.usecase";
import { RefreshTokenUseCase } from "../app/usecases/refresh-token.usecase";
import { buildRequestAuthContext } from "./request-auth-context";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { OptionalJwtAuthGuard } from "./optional-jwt-auth.guard";
import { getRequestUser, requireRequestUser } from "./request-user";
import { REFRESH_TOKEN_REPOSITORY } from "../app/ports/refresh-token.repository";
import type { RefreshTokenRepository } from "../app/ports/refresh-token.repository";
import { TOKEN_SERVICE } from "../app/ports/token.service";
import type { TokenService } from "../app/ports/token.service";
import { SECURITY_EVENT_REPOSITORY } from "../app/ports/security-event.repository";
import type { SecurityEventRepository } from "../app/ports/security-event.repository";
import { SecurityEventService } from "../app/services/security-event.service";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: RefreshTokenRepository,
        @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
        @Inject(SECURITY_EVENT_REPOSITORY) private readonly securityEventRepository: SecurityEventRepository,
        private readonly securityEventService: SecurityEventService,
    ) {}

    @Post('login')
    async login(@Body() body: { email: string; pass: string }, @Req() req: any) {
        return this.loginUseCase.execute(body.email, body.pass, buildRequestAuthContext(req));
    }

    @Post('register')
    async register(@Body() body: { email: string; pass: string }) {
        return this.registerUseCase.execute(body.email, body.pass);
    }

    @Post('refresh')
    async refresh(@Body() body: { refresh_token: string }, @Req() req: any) {
        return this.refreshTokenUseCase.execute(body.refresh_token, buildRequestAuthContext(req));
    }

    @Get('logout')
    @UseGuards(OptionalJwtAuthGuard)
    async logout(@Req() req: any, @Res() res: any) {
        const user = getRequestUser(req);
        if (user && user.token?.id) {
            try {
                await this.refreshTokenRepository.revokeById(user.token.id);
                await this.securityEventService.log(user.id, 'low', 'logout', 'User logged out', { tokenId: user.token.id });
            } catch (e) {
                // Ignore errors during logout revocation
            }
        }
        res.clearCookie('access_token');
        return res.redirect('/login');
    }

    @Get('security/logs')
    @UseGuards(JwtAuthGuard)
    async getSecurityLogs(@Req() req: any) {
        const user = requireRequestUser(req);
        const logs = await this.securityEventRepository.listByUser(user.id, 150);
        return { logs };
    }

    @Get('security/connections')
    @UseGuards(JwtAuthGuard)
    async getConnections(@Req() req: any) {
        const user = requireRequestUser(req);
        const sessions = await this.refreshTokenRepository.listByUser(user.id, 150);
        return { sessions };
    }

    @Get('security/alerts')
    @UseGuards(JwtAuthGuard)
    async getAlerts(@Req() req: any) {
        const user = requireRequestUser(req);
        const alerts = await this.securityEventRepository.listAlertsByUser(user.id, 100);
        return { alerts };
    }

    @Post('security/alerts/read-all')
    @UseGuards(JwtAuthGuard)
    async markAlertsRead(@Req() req: any) {
        const user = requireRequestUser(req);
        await this.securityEventRepository.markAllRead(user.id);
        return { success: true };
    }

    @Post('logout/session')
    @UseGuards(JwtAuthGuard)
    async logoutSession(@Req() req: any, @Body() body: { refresh_token: string }) {
        const user = requireRequestUser(req);
        const token = body?.refresh_token;
        if (!token) throw new UnauthorizedException('refresh_token is required');

        const payload = await this.tokenService.verifyRefreshToken(token);
        if (payload.sub !== user.id) throw new UnauthorizedException('Session does not belong to this user');

        await this.refreshTokenRepository.revokeById(payload.id);
        await this.securityEventService.log(user.id, 'low', 'logout-session', 'Session revoked by user', { tokenId: payload.id });
        return { success: true };
    }

    @Post('logout/all')
    @UseGuards(JwtAuthGuard)
    async logoutAll(@Req() req: any) {
        const user = requireRequestUser(req);
        await this.refreshTokenRepository.revokeByUser(user.id);
        await this.securityEventService.log(user.id, 'middle', 'logout-all', 'All sessions revoked by user');
        return { success: true };
    }
}