import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateOrganizerDto } from './dto/update-organizer.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from './entities/user.entity.js';

@ApiTags('Пользователи')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMyProfile(@Req() req: any) {
    return this.usersService.getMyProfile(req.user.id);
  }

  @Patch('me/profile')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  //Смена пароля
  @Patch('me/password')
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  //Обновление профиля организатора
  @Patch('me/organizer')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER)
  updateOrganizerProfile(@Req() req: any, @Body() dto: UpdateOrganizerDto) {
    return this.usersService.updateOrganizerProfile(req.user.id, dto);
  }

  @Get('me/subscriptions')
  getMySubscriptions(@Req() req: any) {
    return this.usersService.getMySubscriptions(req.user.id);
  }
}