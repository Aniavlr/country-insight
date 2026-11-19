import { Injectable, NotFoundException, Logger } from '@nestjs/common'; // <-- Добавили Logger
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from '../interaction/entities/notification.entity.js';
import { NotificationType } from '../dictionaries/entities/notification-type.entity.js';
import { User } from '../users/entities/user.entity.js';
import { UserProfile } from '../users/entities/user-profile.entity.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(NotificationType)
    private typeRepo: Repository<NotificationType>,
    @InjectRepository(UserProfile) private profileRepo: Repository<UserProfile>,
  ) {}

  //Создать уведомление
  async create(userId: number, message: string, typeName: string) {
    const profile = await this.profileRepo.findOneBy({ user: { id: userId } });
    if (profile && profile.emailNotifications === false) {
      this.logger.debug(`Пользователь ${userId} отключил уведомления. Пропускаем.`);
      return null; // Не отправляем
    }

    const type = await this.typeRepo.findOneBy({ name: typeName });

    if (!type) {
      this.logger.warn(
        `Тип уведомления "${typeName}" не найден в БД. Уведомление не создано.`,
      );
      return null;
    }

    const notification = this.notificationRepo.create({
      user: { id: userId } as User,
      message,
      type,
      sentAt: new Date(),
    });
    return this.notificationRepo.save(notification);
  }

  //Получить мои уведомления
  async getMyNotifications(userId: number) {
    return this.notificationRepo.find({
      where: { user: { id: userId } },
      relations: { type: true },
      order: { createdAt: 'DESC' },
    });
  }

  //Отметить уведомление как прочитанное
  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, user: { id: userId } },
    });
    if (!notification) throw new NotFoundException('Уведомление не найдено');

    notification.isRead = true;
    await this.notificationRepo.save(notification);
    return { message: 'Уведомление прочитано' };
  }

  //Прочитать все
  async markAllAsRead(userId: number) {
    await this.notificationRepo.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
    return { message: 'Все уведомления прочитаны' };
  }
}
