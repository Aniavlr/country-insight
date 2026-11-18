import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Геймификация (Бейджи)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Get('my-badges')
  getMyBadges(@Req() req: any) {
    return this.gamificationService.getUserBadges(req.user.id);
  }

  @Get('all')
  getAllBadges() {
    return this.gamificationService.getAllBadges();
  }
}
