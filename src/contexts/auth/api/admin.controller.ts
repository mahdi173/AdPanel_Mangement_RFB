import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('11111') // Binary digit for Admin - Applied to all routes in this controller
export class AdminController {
  @Get()
  getAdminHome() {
    return 'hello admin';
  }
}
