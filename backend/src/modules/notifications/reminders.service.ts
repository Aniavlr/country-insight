import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull } from 'typeorm'; // <-- Изменили импорт

import { Reminder } from '../interaction/entities/reminder.entity.js';
import { NotificationsService } from './notifications.service.js';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectRepository(Reminder) private reminderRepo: Repository<Reminder>,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleReminders() {
    this.logger.debug('Проверка напоминаний...');
    const now = new Date();

    // Ищем ВСЕ пропущенные и текущие напоминания
    const reminders = await this.reminderRepo.find({
      where: {
        remindAt: LessThanOrEqual(now), //Захватываем всё, что должно было уйти
        sentAt: IsNull(),
      },
      relations: { user: true, event: true, type: true },
      take: 50, // Защита от перегрузки: не больше 50 за раз
    });

    for (const reminder of reminders) {
      // Если сервис вернул null), всё равно пометим как отправленное,
      // чтобы не спамить ошибками каждую минуту.
      await this.notificationsService.create(
        reminder.user.id,
        `Напоминаем, что событие "${reminder.event.title}" начнется совсем скоро (${reminder.type?.name || 'скоро'})!`,
        'Напоминание',
      );

      reminder.sentAt = new Date();
      await this.reminderRepo.save(reminder);
    }
  }
}
