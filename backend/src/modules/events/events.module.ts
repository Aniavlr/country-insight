import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service.js';
import { EventsController } from './events.controller.js';

import { Event } from './entities/event.entity.js';
import { EventImage } from './entities/event-image.entity.js';
import { EventLocation } from './entities/event-location.entity.js';
import { City } from '../dictionaries/entities/city.entity.js';
import { Category } from '../dictionaries/entities/category.entity.js';
import { Format } from '../dictionaries/entities/format.entity.js';
import { AgeLimit } from '../dictionaries/entities/age-limit.entity.js';
import { EventStatus } from '../dictionaries/entities/event-status.entity.js';
import { Organizer } from '../users/entities/organizer.entity.js';
import { EventTicketType } from '../tickets/entities/event-ticket-type.entity.js';
import { TicketType } from '../dictionaries/entities/ticket-type.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventImage,
      EventLocation,
      City,
      Category,
      Format,
      AgeLimit,
      EventStatus,
      Organizer,
      EventTicketType,
      TicketType,
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
