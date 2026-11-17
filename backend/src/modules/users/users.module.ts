import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity.js';
import { UserProfile } from './entities/user-profile.entity.js';
import { Organizer } from './entities/organizer.entity.js';
import { Subscription } from './entities/subscription.entity.js';
import { City } from '../dictionaries/entities/city.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { Category } from '../dictionaries/entities/category.entity.js';

import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { OrganizersController } from './organizers.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      Organizer,
      Subscription,
      City,
      Event,
      Category,
    ]),
  ],
  controllers: [UsersController, OrganizersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
