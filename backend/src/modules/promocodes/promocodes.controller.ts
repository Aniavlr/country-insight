import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PromocodesService } from './promocodes.service.js';
import { CreatePromocodeDto } from './dto/create-promocode.dto.js';
import { ValidatePromocodeDto } from './dto/validate-promocode.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';

@ApiTags('Промокоды')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('promocodes')
export class PromocodesController {
  constructor(private promocodesService: PromocodesService) {}

  @Post()
  @Roles(UserRole.ORGANIZER)
  create(@Body() dto: CreatePromocodeDto, @Req() req: any) {
    return this.promocodesService.create(dto, req.user);
  }

  @Get('event/:eventId')
  @Roles(UserRole.ORGANIZER)
  findByEvent(@Param('eventId') eventId: string, @Req() req: any) {
    return this.promocodesService.findByEvent(+eventId, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ORGANIZER)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.promocodesService.remove(+id, req.user);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ORGANIZER)
  validateCode(@Body() dto: ValidatePromocodeDto) {
    return this.promocodesService.validateCode(dto.code, dto.eventId);
  }
}
