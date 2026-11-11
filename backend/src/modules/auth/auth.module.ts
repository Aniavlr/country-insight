import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PassportModule } from '@nestjs/passport';

import { User } from '../users/entities/user.entity.js';
import { UserProfile } from '../users/entities/user-profile.entity.js';
import { Organizer } from '../users/entities/organizer.entity.js';
import { VerificationStatus } from '../dictionaries/entities/verification-status.entity.js';
import { OrganizerType } from '../dictionaries/entities/organizer-type.entity.js';
import { City } from '../dictionaries/entities/city.entity.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      Organizer,
      VerificationStatus,
      OrganizerType,
      City,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }, // Токен живет 7 дней
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
