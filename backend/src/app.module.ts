import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DictionariesModule } from './modules/dictionaries/dictionaries.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { EventsModule } from './modules/events/events.module.js';
import { TicketsModule } from './modules/tickets/tickets.module.js';
import { InteractionModule } from './modules/interaction/interaction.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { PromocodesModule } from './modules/promocodes/promocodes.module.js';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    DictionariesModule,
    UsersModule,
    EventsModule,
    TicketsModule,
    InteractionModule,
    AuthModule,
    AnalyticsModule,
    AdminModule,
    NotificationsModule,
    PromocodesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
