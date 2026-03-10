import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { USER_REPOSITORY } from "../ports/user.repository";
import type { UserRepository } from "../ports/user.repository";
import { PASSWORD_SERVICE } from "../ports/password.service";
import type { PasswordService } from "../ports/password.service";
import { User } from "../../domain/user.entity";

@Injectable()
export class RegisterUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        @Inject(PASSWORD_SERVICE) private readonly passwordService: PasswordService
    ) {}
    
    async execute(email: string, pass: string) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        const hashedPassword = await this.passwordService.hash(pass);
        const newUser = new User(
            '', // Repository will generate ID
            email,
            hashedPassword,
            '00001' // Default User permission
        );

        await this.userRepository.save(newUser);
        return { message: 'User registered successfully' };
    }
}
