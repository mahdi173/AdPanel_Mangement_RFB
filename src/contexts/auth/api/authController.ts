import { Controller, Post, Body } from "@nestjs/common";
import { LoginUseCase } from "../app/usecases/login.usecase";
import { RegisterUseCase } from "../app/usecases/register.usecase";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase
    ) {}

    @Post('login')
    async login(@Body() body: { email: string; pass: string }) {
        return this.loginUseCase.execute(body.email, body.pass);
    }

    @Post('register')
    async register(@Body() body: { email: string; pass: string }) {
        return this.registerUseCase.execute(body.email, body.pass);
    }
}