import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    // If user is not authenticated or doesn't have permissions, return 404
    if (!user || !user.permissions) {
      throw new NotFoundException();
    }

    // Check if user has any of the required permissions (binary match)
    const hasRole = requiredRoles.some((role) => user.permissions === role);

    if (!hasRole) {
      throw new NotFoundException();
    }

    return true;
  }
}
