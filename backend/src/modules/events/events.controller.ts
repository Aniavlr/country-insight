import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service.js';

import { CreateEventDto } from './dto/create-event.dto.js';
import { EventFilterDto } from './dto/event-filter.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { UpdateEventStatusDto } from './dto/update-event-status.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';

@ApiTags('События')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  create(@Body() dto: CreateEventDto, @Req() req: any) {
    return this.eventsService.create(dto, req.user);
  }

  @Get('random')
  findRandom(@Query('cityId') cityId?: string) {
     return this.eventsService.findRandom(cityId ? +cityId : undefined);
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  findMyEvents(@Req() req: any) {
    return this.eventsService.findMyEvents(req.user.id);
  }

  @Get('admin/pending')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findPending() {
    return this.eventsService.findPending();
  }

  @Get()
  findAll(@Query() filters: EventFilterDto) {
    return this.eventsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  update(
    @Param('id') id: number,
    @Body() dto: UpdateEventDto,
    @Req() req: any,
  ) {
    return this.eventsService.update(+id, dto, req.user);
  }

  // Отмена события (Организатор)
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  cancel(@Param('id') id: number, @Req() req: any) {
    return this.eventsService.cancel(+id, req.user);
  }

  // Модерация события (Админ)
  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: number, @Body() dto: UpdateEventStatusDto) {
    return this.eventsService.updateStatus(+id, dto.statusId);
  }
}
