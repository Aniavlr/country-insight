import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TicketsController } from './tickets.controller.js';
import { TicketsService } from './tickets.service.js';

import { EventTicketType } from './entities/event-ticket-type.entity.js';
import { Promocode } from './entities/promocode.entity.js';
import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { ETicket } from './entities/e-ticket.entity.js';
import { RefundRequest } from './entities/refund-request.entity.js';
import { OrderStatus } from '../dictionaries/entities/order-status.entity.js';
import { ETicketStatus } from '../dictionaries/entities/e-ticket-status.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { Organizer } from '../users/entities/organizer.entity.js';
import { Reminder } from '../interaction/entities/reminder.entity.js';
import { ReminderType } from '../dictionaries/entities/reminder-type.entity.js';

import { NotificationsModule } from '../notifications/notifications.module.js';
import { GamificationModule } from '../gamification/gamification.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventTicketType,
      Promocode,
      Order,
      OrderItem,
      ETicket,
      RefundRequest,
      OrderStatus,
      ETicketStatus,
      Event,
      Organizer,
      Reminder,
      ReminderType,
    ]),
    NotificationsModule,
    GamificationModule,
  ],
  exports: [TypeOrmModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
