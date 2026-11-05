import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';

import { City } from "./entities/city.entity.js";
import { Category } from "./entities/category.entity.js";
import { Format } from "./entities/format.entity.js";
import { AgeLimit } from "./entities/age-limit.entity.js";
import { OrganizerType } from "./entities/organizer-type.entity.js";
import { TicketType } from "./entities/ticket-type.entity.js";
import { OrderStatus } from "./entities/order-status.entity.js";
import { ETicketStatus } from "./entities/e-ticket-status.entity.js";
import { Badge } from "./entities/badge.entity.js";
import { EventStatus } from "./entities/event-status.entity.js";
import { VerificationStatus } from "./entities/verification-status.entity.js";
import { ReminderType } from "./entities/reminder-type.entity.js";
import { NotificationType } from "./entities/notification-type.entity.js";

const entities = [
  City, Category, Format, AgeLimit, OrganizerType, 
  TicketType, OrderStatus, ETicketStatus, Badge, 
  EventStatus, VerificationStatus, ReminderType, NotificationType
];

@Module({
    imports: [TypeOrmModule.forFeature(entities)],
     exports: [TypeOrmModule],
})
export class DictionariesModule {}