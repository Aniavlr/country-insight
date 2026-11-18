import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromocodesService } from './promocodes.service.js';
import { PromocodesController } from './promocodes.controller.js';

import { Promocode } from '../tickets/entities/promocode.entity.js';
import { Event } from '../events/entities/event.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Promocode, Event])],
  controllers: [PromocodesController],
  providers: [PromocodesService],
})
export class PromocodesModule {}
