import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Организаторы')
@Controller('organizers')
export class OrganizersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.getOrganizerPublicProfile(+id);
  }

  @Post(':id/subscribe')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  subscribe(@Param('id') id: string, @Req() req: any) {
    return this.usersService.subscribe(+id, req.user.id);
  }

  @Delete(':id/subscribe')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  unsubscribe(@Param('id') id: string, @Req() req: any) {
    return this.usersService.unsubscribe(+id, req.user.id);
  }
}