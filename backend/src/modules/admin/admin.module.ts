import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';

import { User } from '../users/entities/user.entity.js';
import { Organizer } from '../users/entities/organizer.entity.js';
import { Complaint } from '../interaction/entities/complaint.entity.js';
import { VerificationStatus } from '../dictionaries/entities/verification-status.entity.js';
import { Review } from '../interaction/entities/review.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organizer, Complaint, VerificationStatus, Review]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}