import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Favorite } from './entities/favorite.entity.js';
import { Review } from './entities/review.entity.js';
import { ReviewPhoto } from './entities/review-photo.entity.js';
import { Notification } from './entities/notification.entity.js';
import { Reminder } from './entities/reminder.entity.js';
import { Complaint } from './entities/complaint.entity.js';
import { UserBadge } from './entities/user-badge.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { ETicket } from '../tickets/entities/e-ticket.entity.js';

import { InteractionService } from './interaction.service.js';
import { InteractionController } from './interaction.controller.js';
import { ReviewsService } from './reviews.service.js';
import { ReviewsController } from './reviews.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Favorite,
      Review,
      ReviewPhoto,
      Notification,
      Reminder,
      Complaint,
      UserBadge,
      Event,
      ETicket,
    ]),
  ],
  controllers: [InteractionController, ReviewsController],
  providers: [InteractionService, ReviewsService],
  exports: [TypeOrmModule],
})
export class InteractionModule {}
