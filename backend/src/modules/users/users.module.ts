import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UserProfile } from './entities/user-profile.entity.js';
import { Organizer } from './entities/organizer.entity.js';
import { Subscription } from './entities/subscription.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Organizer, Subscription]),
  ],
  exports: [TypeOrmModule],
})
export class UsersModule {}
