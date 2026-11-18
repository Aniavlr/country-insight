import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationService } from './gamification.service.js';
import { GamificationController } from './gamification.controller.js';

import { ETicket } from '../tickets/entities/e-ticket.entity.js';
import { Badge } from '../dictionaries/entities/badge.entity.js';
import { UserBadge } from '../interaction/entities/user-badge.entity.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ETicket, Badge, UserBadge]),
    NotificationsModule,
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService], // Экспортируем, чтобы использовать в TicketsModule
})
export class GamificationModule {}
