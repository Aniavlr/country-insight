import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity.js';
import { EventImage } from './entities/event-image.entity.js';
import { EventLocation } from './entities/event-location.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventImage, EventLocation]),
  ],
  exports: [TypeOrmModule],
})
export class EventsModule {}
