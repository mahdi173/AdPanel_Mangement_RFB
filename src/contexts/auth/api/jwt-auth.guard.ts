import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { TOKEN_SERVICE } from '../app/ports/token.service';
import type { TokenService } from '../app/ports/token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Authentication required');

    const payload = await this.tokenService.verifyAccessToken(token);
    request.user = {
      id: payload.sub,
      email: payload.email,
      permissions: payload.permissions,
      token: {
        id: payload.id,
        sub: payload.sub,
        familyId: payload.familyId,
        parentId: payload.parentId,
        isRevoked: payload.isRevoked,
        version: payload.version,
        typ: payload.typ,
        iat: payload.iat,
        exp: payload.exp,
      },
    };
    return true;
  }

  private extractToken(req: any): string | undefined {
    const authHeader = req?.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice('Bearer '.length).trim();
    }

    // Support cookie-based access_token (works with cookie-parser, and a naive fallback)
    const cookieToken = req?.cookies?.access_token;
    if (typeof cookieToken === 'string' && cookieToken.length > 0) return cookieToken;

    const cookieHeader = req?.headers?.cookie;
    if (typeof cookieHeader === 'string' && cookieHeader.length > 0) {
      const cookies = cookieHeader.split(';').map((c: string) => c.trim());
      for (const c of cookies) {
        const idx = c.indexOf('=');
        if (idx === -1) continue;
        const name = c.slice(0, idx);
        const value = c.slice(idx + 1);
        if (name === 'access_token') return value;
      }
    }

    return undefined;
  }
}
