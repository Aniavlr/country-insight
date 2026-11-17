import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';

@ApiTags('Аналитика')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

 @Get('dashboard')
  @Roles(UserRole.ORGANIZER)
  getDashboard(@Req() req: any, @Query('eventId') eventId?: string) {
    return this.analyticsService.getOrganizerDashboard(
      req.user.id, 
      eventId ? +eventId : undefined
    );
  }

  @Get('admin-dashboard')
  @Roles(UserRole.ADMIN)
  getAdminDashboard() {
    return this.analyticsService.getAdminDashboard();
  }
}
