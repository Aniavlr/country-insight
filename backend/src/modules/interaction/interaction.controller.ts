import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InteractionService } from './interaction.service.js';
import { CreateComplaintDto } from './dto/create-complaint.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Избранное и Жалобы')
@Controller('interaction')
export class InteractionController {
  constructor(private interactionService: InteractionService) {}

  // --- Избранное ---
  @Post('favorites/:eventId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  addToFavorites(@Param('eventId') eventId: string, @Req() req: any) {
    return this.interactionService.addToFavorites(+eventId, req.user.id);
  }

  @Get('favorites')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMyFavorites(@Req() req: any) {
    return this.interactionService.getMyFavorites(req.user.id);
  }

  @Delete('favorites/:eventId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  removeFromFavorites(@Param('eventId') eventId: string, @Req() req: any) {
    return this.interactionService.removeFromFavorites(+eventId, req.user.id);
  }

  // --- Жалобы ---
  @Post('complaints')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createComplaint(@Body() dto: CreateComplaintDto, @Req() req: any) {
    return this.interactionService.createComplaint(dto, req.user.id);
  }
}
