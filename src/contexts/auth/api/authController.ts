import { Controller, Post, Body, Get, Res } from "@nestjs/common";
import { LoginUseCase } from "../app/usecases/login.usecase";
import { RegisterUseCase } from "../app/usecases/register.usecase";
import { RefreshTokenUseCase } from "../app/usecases/refresh-token.usecase";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase
    ) {}

    @Post('login')
    async login(@Body() body: { email: string; pass: string }) {
        return this.loginUseCase.execute(body.email, body.pass);
    }

    @Post('register')
    async register(@Body() body: { email: string; pass: string }) {
        return this.registerUseCase.execute(body.email, body.pass);
    }

    @Post('refresh')
    async refresh(@Body() body: { refresh_token: string }) {
        return this.refreshTokenUseCase.execute(body.refresh_token);
    }

    @Get('logout')
    async logout(@Res() res: any) {
        res.clearCookie('access_token');
        return res.redirect('/login');
    }
}