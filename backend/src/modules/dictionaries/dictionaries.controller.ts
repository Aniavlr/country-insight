import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';

import { City } from './entities/city.entity.js';
import { Event } from '../events/entities/event.entity.js';

@ApiTags('Справочники')
@Controller('cities')
export class CitiesController {
  constructor(
    @InjectRepository(City) private cityRepo: Repository<City>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
  ) {}

  @Get()
  async getAllCities() {
    const cities = await this.cityRepo.find();
    const now = new Date();

    const result = await Promise.all(
      cities.map(async (city) => {
        const eventsCount = await this.eventRepo.count({
          where: {
            city: { id: city.id },
            status: { name: 'Одобрено' },
            endDate: MoreThanOrEqual(now),
          },
        });

        return {
          ...city,
          eventsCount,
        };
      }),
    );

    return result;
  }
}
