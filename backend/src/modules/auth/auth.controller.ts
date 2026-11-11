import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { OrganizerRegisterDto } from './dto/organizer-register.dto.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.registerUser(dto);
  }

  @Post('register-organizer')
  registerOrganizer(@Body() dto: OrganizerRegisterDto) {
    return this.authService.registerOrganizer(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return req.user;
  }
}
