import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { TokenPayload } from '../app/ports/token.service';

export type AuthenticatedUser = {
  id: string;
  email: string;
  permissions?: string;
  token?: Pick<TokenPayload, 'sub' | 'typ' | 'iat' | 'exp'>;
};

export type RequestWithUser = Request & { user?: AuthenticatedUser };

export function getRequestUser(req: Request): AuthenticatedUser | undefined {
  return (req as RequestWithUser).user;
}

export function requireRequestUser(req: Request): AuthenticatedUser {
  const user = getRequestUser(req);
  if (!user) throw new UnauthorizedException('Authentication required');
  return user;
}

