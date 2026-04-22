import { Inject, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TOKEN_SERVICE } from '../app/ports/token.service';
import type { TokenService } from '../app/ports/token.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Let it pass, guards can handle strict check if needed
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.tokenService.verifyAccessToken(token);
      (req as any).user = {
        id: payload.sub,
        email: payload.email,
        permissions: payload.permissions,
        token: {
          sub: payload.sub,
          typ: payload.typ,
          iat: payload.iat,
          exp: payload.exp,
        },
      };
      next();
    } catch (error) {
      // If token is invalid/expired, we don't attach user
      // Guards like RolesGuard will then block access
      next();
    }
  }
}
