import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsController } from './analytics.controller.js';

import { Organizer } from '../users/entities/organizer.entity.js';
import { Order } from '../tickets/entities/order.entity.js';
import { ETicket } from '../tickets/entities/e-ticket.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Event } from '../events/entities/event.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organizer, Order, ETicket, User, Event]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}