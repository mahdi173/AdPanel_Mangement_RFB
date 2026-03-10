import { User } from "../../domain/user.entity"

export interface TokenService {
  generate(user: User): Promise<string>;
  verify(token: string): Promise<any>;
}

export const TOKEN_SERVICE = 'TOKEN_SERVICE';
