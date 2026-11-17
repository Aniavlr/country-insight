import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
  Query,
  Header,
  Res,
  Patch,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { TicketsService } from './tickets.service.js';
import { AddGuestDto } from './dto/add-guest.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { CreateRefundDto } from './dto/create-refund.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';

@ApiTags('Билеты')
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post('order')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER) // Заказывать могут только обычные пользователи
  createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.ticketsService.createOrder(dto, req.user);
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['upcoming', 'past', 'cancelled'],
    description: 'Фильтр по времени события',
  })
  getMyTickets(
    @Req() req: any,
    @Query('type') type?: 'upcoming' | 'past' | 'cancelled',
  ) {
    return this.ticketsService.getMyTickets(req.user.id, type);
  }

  @Post('add-guest')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  addGuest(@Body() dto: AddGuestDto, @Req() req: any) {
    return this.ticketsService.addGuestManually(dto, req.user);
  }

  @Get('export/:eventId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename=guests.xlsx')
  async exportGuests(
    @Param('eventId') eventId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const buffer = await this.ticketsService.exportGuests(+eventId, req.user);
    // Отправляем файл напрямую в ответ
    res.end(buffer);
  }

  @Patch(':id/validate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  validateById(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.validateTicketById(+id, req.user);
  }

  @Post('validate/:code')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER) // Отмечать могут только организаторы
  validateTicket(@Param('code') code: string, @Req() req: any) {
    return this.ticketsService.validateTicket(code, req.user);
  }

  @Post('refund')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  requestRefund(@Body() dto: CreateRefundDto, @Req() req: any) {
    return this.ticketsService.requestRefund(dto, req.user);
  }

  @Patch('refund/:id/process')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  processRefund(
    @Param('id') id: string,
    @Body('action') action: 'approve' | 'reject',
    @Req() req: any,
  ) {
    return this.ticketsService.processRefund(+id, action, req.user);
  }

  @Get('event/:eventId/guests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  getEventGuests(@Param('eventId') eventId: string, @Req() req: any) {
    return this.ticketsService.getEventGuests(+eventId, req.user);
  }
}
