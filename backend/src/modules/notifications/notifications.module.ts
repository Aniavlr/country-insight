import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';

import { Notification } from '../interaction/entities/notification.entity.js';
import { NotificationType } from '../dictionaries/entities/notification-type.entity.js';
import { Reminder } from '../interaction/entities/reminder.entity.js';
import { Event } from '../events/entities/event.entity.js';

import { RemindersService } from './reminders.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationType, Reminder, Event]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, RemindersService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
