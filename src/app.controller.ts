import { Controller, Get, Render, Req, UseGuards, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { OptionalJwtAuthGuard } from './contexts/auth/api/optional-jwt-auth.guard';
import { PANEL_REPOSITORY } from './contexts/panels/app/ports/panel.repository';
import type { PanelRepository } from './contexts/panels/app/ports/panel.repository';
import { GROUP_REPOSITORY } from './contexts/groups/app/ports/group.repository';
import type { GroupRepository } from './contexts/groups/app/ports/group.repository';
import { StripeService } from './contexts/payment/app/service/payment.service';
import { USER_REPOSITORY } from './contexts/auth/app/ports/user.repository';
import type { UserRepository } from './contexts/auth/app/ports/user.repository';
import { Panel } from './contexts/panels/domain/panel.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(PANEL_REPOSITORY)
    private readonly panelRepository: PanelRepository,
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly stripeService: StripeService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @Render('home')
  async getHome(@Req() req: any) {
    let panels: Panel[] = [];
    let myGroups: any[] = [];
    
    if (req.user) {
      const fullUser = await this.userRepository.findById(req.user.id);
      if (fullUser) {
        req.user = fullUser;
      }

      if (req.user.permissions === '11111') {
        panels = await this.panelRepository.findAll();
      } else {
        panels = await this.panelRepository.getRecentOccupied(10);
      }
      
      const allGroups = await this.groupRepository.findAll();
      myGroups = allGroups.filter(g => g.users && g.users.some(u => u.id === req.user.id));
    }

    const plans = await this.stripeService.getPlans();

    return {
      title: 'Home',
      user: req.user,
      panels: panels,
      groups: myGroups,
      plans: plans,
    };
  }

  @Get('success')
  @Render('stripe/success')
  getSuccess() {
    return { title: 'Success' };
  }

  @Get('cancel')
  @Render('stripe/cancel')
  getCancel() {
    return { title: 'Canceled' };
  }

  @Get('login.html')
  @Render('login')
  getLoginOld() {
    return { title: 'Login' };
  }

  @Get('login')
  @Render('login')
  getLogin() {
    return { title: 'Login' };
  }
}
