import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ETicket } from '../tickets/entities/e-ticket.entity.js';
import { Badge } from '../dictionaries/entities/badge.entity.js';
import { UserBadge } from '../interaction/entities/user-badge.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    @InjectRepository(ETicket) private eTicketRepo: Repository<ETicket>,
    @InjectRepository(Badge) private badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge) private userBadgeRepo: Repository<UserBadge>,
    private notificationsService: NotificationsService,
  ) {}

  // Главный метод: проверяет и выдает бейджи
  async checkAndAwardBadges(userId: number) {
    try {
      // 1. Собираем все погашенные билеты
      const usedTickets = await this.eTicketRepo.find({
        where: { isUsed: true, orderItem: { order: { user: { id: userId } } } },
        relations: { orderItem: { ticketType: { event: { category: true } } } },
      });

      if (usedTickets.length === 0) return;

      // 2. Убираем дубликаты событий (считаем уникальные посещения)
      const uniqueEventsMap = new Map();
      usedTickets.forEach((t) => {
        const event = t.orderItem.ticketType.event;
        uniqueEventsMap.set(event.id, { event, ticket: t }); // Сохраняем событие и один билет (для дат)
      });

      const uniqueEvents = Array.from(uniqueEventsMap.values());
      const attendedCount = uniqueEvents.length; // <-- Теперь это количество УНИКАЛЬНЫХ событий

      // 3. Считаем ночные события
      const nightEvents = uniqueEvents.filter(({ event }) => {
        const startHour = new Date(event.startDate).getHours();
        return startHour >= 22 || startHour < 6;
      }).length;

      // 4. Считаем утренние события
      const earlyEvents = uniqueEvents.filter(({ event }) => {
        const startHour = new Date(event.startDate).getHours();
        return startHour < 10;
      }).length;

      // 5. Считаем по категориям
      const categories = uniqueEvents
        .map(({ event }) => event.category?.slug)
        .filter(Boolean);
      const uniqueCategories = new Set(categories).size;
      const foodEvents = categories.filter((c) => c === 'food-drinks').length;
      const workshopEvents = categories.filter((c) => c === 'workshops').length;
      const musicEvents = categories.filter((c) => c === 'music').length;

      // 6. Считаем события за последний месяц (по дате гашения билета)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const eventsInMonth = uniqueEvents.filter(
        ({ ticket }) => new Date(ticket.usedAt) >= oneMonthAgo,
      ).length;

      // 7. Определяем, какие бейджи нужно выдать
      const badgesToAward: string[] = [];
      if (attendedCount >= 1) badgesToAward.push('Первый шаг');
      if (attendedCount >= 5) badgesToAward.push('Посетил 5 событий');
      if (attendedCount >= 10) badgesToAward.push('Посетил 10 событий');
      if (nightEvents >= 3) badgesToAward.push('Ночной житель города');
      if (foodEvents >= 3) badgesToAward.push('Гурман');
      if (workshopEvents >= 3) badgesToAward.push('Мастер на все руки');
      if (musicEvents >= 3) badgesToAward.push('Меломан');
      if (uniqueCategories >= 3) badgesToAward.push('Исследователь');
      if (eventsInMonth >= 5) badgesToAward.push('Тусовщик');
      if (earlyEvents >= 1) badgesToAward.push('Ранняя пташка');

      // 8. Выдаем бейджи
      for (const badgeName of badgesToAward) {
        const badge = await this.badgeRepo.findOneBy({ name: badgeName });
        if (!badge) continue;

        const existing = await this.userBadgeRepo.findOneBy({
          user: { id: userId },
          badge: { id: badge.id },
        });

        if (!existing) {
          await this.userBadgeRepo.save(
            this.userBadgeRepo.create({
              user: { id: userId } as any,
              badge,
            }),
          );

          await this.notificationsService.create(
            userId,
            `Вы получили новый бейдж: "${badge.name}"!`,
            'Системное',
          );
        }
      }
    } catch (err: any) {
      this.logger.warn(
        `Ошибка при выдаче бейджей для юзера ${userId}: ${err.message}`,
      );
    }
  }

  // Получить бейджи пользователя (для профиля)
  async getUserBadges(userId: number) {
    return this.userBadgeRepo.find({
      where: { user: { id: userId } },
      relations: { badge: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllBadges() {
    return this.badgeRepo.find({
      order: { id: 'ASC' },
    });
  }
}
