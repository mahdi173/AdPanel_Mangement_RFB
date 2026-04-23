import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenClaims, TokenPayload, TokenService } from '../app/ports/token.service';
import { User } from '../domain/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class JwtTokenService implements TokenService {
  private readonly secret = process.env.JWT_SECRET || 'super-secret';
  private readonly accessTokenExp = 3600; // 1 hour in seconds
  private readonly refreshTokenExp = 604800; // 7 days in seconds

  async generateAccessToken(user: User, claims?: Partial<RefreshTokenClaims>): Promise<string> {
    const payload: TokenPayload = {
      sub: user.id,
      id: claims?.id ?? crypto.randomUUID(),
      email: user.email,
      permissions: user.permissions,
      familyId: claims?.familyId,
      parentId: claims?.parentId,
      isRevoked: claims?.isRevoked ?? false,
      version: claims?.version ?? 1,
      typ: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.accessTokenExp,
    };
    return this.sign(payload);
  }

  async generateRefreshToken(user: User, claims: RefreshTokenClaims): Promise<string> {
    const payload: TokenPayload = {
      sub: user.id,
      id: claims.id,
      email: user.email,
      familyId: claims.familyId,
      parentId: claims.parentId,
      isRevoked: claims.isRevoked,
      version: claims.version,
      typ: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.refreshTokenExp,
    };
    return this.sign(payload);
  }

  private async sign(payload: TokenPayload): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    
    const b64Header = this.toBase64Url(header);
    const b64Payload = this.toBase64Url(payload);
    
    const signature = this.createSignature(b64Header, b64Payload, this.secret);
    
    return `${b64Header}.${b64Payload}.${signature}`;
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.verify(token, 'access');
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.verify(token, 'refresh');
  }

  private async verify(token: string, expectedType?: TokenPayload['typ']): Promise<TokenPayload> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Invalid token format');
    }

    const [headerB64, payloadB64, signature] = parts;

    // Verify signature
    const expectedSignature = this.createSignature(headerB64, payloadB64, this.secret);
    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid token signature');
    }

    // Decode payload
    const payload = this.fromBase64Url(payloadB64) as TokenPayload;

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new UnauthorizedException('Token expired');
    }

    if (expectedType && payload.typ !== expectedType) {
      throw new UnauthorizedException('Invalid token type');
    }

    return payload;
  }

  private toBase64Url(obj: any): string {
    const str = JSON.stringify(obj);
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private fromBase64Url(b64string: string): any {
    // Add padding back
    let base64 = b64string.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const str = Buffer.from(base64, 'base64').toString();
    return JSON.parse(str);
  }

  private createSignature(header: string, payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}
