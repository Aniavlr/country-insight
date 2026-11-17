import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service.js';

import { ChangeRoleDto } from './dto/change-role.dto.js';
import { ProcessComplaintDto } from './dto/process-complaint.dto.js';
import { VerifyOrganizerDto } from './dto/verify-organizer.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';

@ApiTags('Администратор')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Пользователи
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/block')
  toggleBlock(@Param('id') id: string) {
    return this.adminService.toggleBlockUser(+id);
  }

  @Patch('users/:id/role')
  changeRole(
    @Param('id') id: string,
    @Body() dto: ChangeRoleDto,
    @Req() req: any,
  ) {
    return this.adminService.changeUserRole(+id, dto, req.user.id);
  }

  //Организаторы
  @Get('organizers/pending')
  getPendingOrganizers() {
    return this.adminService.getPendingOrganizers();
  }

  @Patch('organizers/:id/verify')
  verifyOrganizer(@Param('id') id: string, @Body() dto: VerifyOrganizerDto) {
    return this.adminService.verifyOrganizer(
      +id,
      dto.status as 'Одобрен' | 'Отклонён',
    );
  }

  //Жалобы
  @Get('complaints')
  getComplaints() {
    return this.adminService.getComplaints();
  }

  @Patch('complaints/:id/process')
  processComplaint(@Param('id') id: string, @Body() dto: ProcessComplaintDto) {
    return this.adminService.processComplaint(+id, dto);
  }
}
