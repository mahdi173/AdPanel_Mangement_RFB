import { Controller, Post, Body } from "@nestjs/common";
import { LoginUseCase } from "../app/usecases/login.usecase";

@Controller('auth')
export class AuthController {
    constructor(private readonly loginUseCase: LoginUseCase) {}

    @Post('login')
    async login(@Body() body: { email: string; pass: string }) {
        return this.loginUseCase.execute(body.email, body.pass);
    }
}