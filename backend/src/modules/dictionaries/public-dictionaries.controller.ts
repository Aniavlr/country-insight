import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity.js';
import { Format } from './entities/format.entity.js';
import { AgeLimit } from './entities/age-limit.entity.js';
import { OrganizerType } from './entities/organizer-type.entity.js';
import { TicketType } from './entities/ticket-type.entity.js';

@ApiTags('Справочники (Публичные)')
@Controller('dictionaries')
export class PublicDictionariesController {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Format) private formatRepo: Repository<Format>,
    @InjectRepository(AgeLimit) private ageLimitRepo: Repository<AgeLimit>,
    @InjectRepository(OrganizerType)
    private organizerTypeRepo: Repository<OrganizerType>,
    @InjectRepository(TicketType)
    private ticketTypeRepo: Repository<TicketType>,
  ) {}

  @Get('categories')
  getCategories() {
    return this.categoryRepo.find();
  }

  @Get('formats')
  getFormats() {
    return this.formatRepo.find();
  }

  @Get('age-limits')
  getAgeLimits() {
    return this.ageLimitRepo.find();
  }

  @Get('organizer-types')
  getOrganizerTypes() {
    return this.organizerTypeRepo.find();
  }

  @Get('ticket-types')
  getTicketTypes() {
    return this.ticketTypeRepo.find();
  }
}
