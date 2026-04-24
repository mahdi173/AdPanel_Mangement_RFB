import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { USER_REPOSITORY } from "../ports/user.repository";
import type { UserRepository } from "../ports/user.repository";
import { PASSWORD_SERVICE } from "../ports/password.service";
import type { PasswordService } from "../ports/password.service";
import { BLOOM_FILTER_PORT } from "../ports/bloom-filter.port";
import type { BloomFilterPort } from "../ports/bloom-filter.port";
import { User } from "../../domain/user.entity";

@Injectable()
export class RegisterUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        @Inject(PASSWORD_SERVICE) private readonly passwordService: PasswordService,
        @Inject(BLOOM_FILTER_PORT) private readonly bloomFilter: BloomFilterPort,
    ) {}
    
    async execute(email: string, pass: string) {
        // Bloom Filter Check: If it says 'false', email definitely doesn't exist in DB.
        // If it says 'true', it 'might' exist, so we check the DB.
        if (await this.bloomFilter.mightExist(email)) {
            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                throw new BadRequestException('User already exists');
            }
        }

        const hashedPassword = await this.passwordService.hash(pass);
        const newUser = new User(
            '', // Repository will generate ID
            email,
            hashedPassword,
            '00001' // Default User permission
        );

        await this.userRepository.save(newUser);
        
        // Add the new email to the Bloom Filter
        await this.bloomFilter.add(email);
        
        return { message: 'User registered successfully' };
    }
}
