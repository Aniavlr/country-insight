import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organizer } from '../users/entities/organizer.entity.js';
import { Order } from '../tickets/entities/order.entity.js';
import { ETicket } from '../tickets/entities/e-ticket.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Event } from '../events/entities/event.entity.js';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Organizer) private organizerRepo: Repository<Organizer>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(ETicket) private eTicketRepo: Repository<ETicket>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
  ) {}

  // Главный метод дашборда
  async getOrganizerDashboard(userId: number, eventId?: number) {
    const organizer = await this.organizerRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!organizer) throw new NotFoundException('Организатор не найден');

    const organizerId = organizer.id;

    // Базовый запрос (мы будем переиспользовать его для разных метрик)
    // Если передан eventId, фильтруем по нему, иначе по всем событиям организатора
    const baseQuery = () => {
      const q = this.orderRepo
        .createQueryBuilder('order')
        .leftJoin('order.event', 'event')
        .leftJoin('order.status', 'status')
        .where('event.organizer = :organizerId', { organizerId });

      if (eventId) {
        q.andWhere('event.id = :eventId', { eventId });
      }
      return q;
    };

    // 1. Выручка по оплаченным заказам (без JOIN с items, чтобы не дублировать сумму)
    const paidRevenue = await baseQuery()
      .andWhere('status.name = :paidStatus', { paidStatus: 'Оплачен' })
      .select('SUM(order.totalAmount)', 'totalRevenue')
      .getRawOne();

    // Количество проданных билетов по оплаченным заказам (только здесь JOIN с items)
    const paidTickets = await baseQuery()
      .leftJoin('order.items', 'items')
      .andWhere('status.name = :paidStatus', { paidStatus: 'Оплачен' })
      .select('SUM(items.quantity)', 'totalTicketsSold')
      .getRawOne();

    // 2. Ожидающие оплаты: потенциальная выручка (БЕЗ JOIN)
    const pendingRevenue = await baseQuery()
      .andWhere('status.name = :pendingStatus', {
        pendingStatus: 'Ожидает оплаты',
      })
      .select('SUM(order.totalAmount)', 'potentialRevenue')
      .getRawOne();

    // Ожидающие оплаты: количество забронированных билетов (С JOIN)
    const pendingTicketsStats = await baseQuery()
      .leftJoin('order.items', 'items')
      .andWhere('status.name = :pendingStatus', {
        pendingStatus: 'Ожидает оплаты',
      })
      .select('SUM(items.quantity)', 'pendingTickets')
      .getRawOne();

    // 3. Отчет по явке
    const attendanceQuery = this.eTicketRepo
      .createQueryBuilder('ticket')
      .leftJoin('ticket.orderItem', 'item')
      .leftJoin('item.order', 'order')
      .leftJoin('order.status', 'orderStatus')
      .leftJoin('order.event', 'event')
      .where('event.organizer = :organizerId', { organizerId })
      .andWhere('orderStatus.name = :paidStatus', { paidStatus: 'Оплачен' });

    if (eventId) attendanceQuery.andWhere('event.id = :eventId', { eventId });

    const attendanceStats = await attendanceQuery
      .select('COUNT(ticket.id)', 'totalTickets')
      .addSelect(
        'SUM(CASE WHEN ticket.isUsed = true THEN 1 ELSE 0 END)',
        'attendedTickets',
      )
      .getRawOne();

    const totalTickets = parseInt(attendanceStats?.totalTickets || '0', 10);
    const attendedTickets = parseInt(
      attendanceStats?.attendedTickets || '0',
      10,
    );

    // 4. Топ событий (если запрашивают конкретное событие, топ не нужен, вернем пустой массив)
    let topEvents: any[] = [];
    if (!eventId) {
      topEvents = await this.orderRepo
        .createQueryBuilder('order')
        .leftJoin('order.event', 'event')
        .leftJoin('order.status', 'status')
        .where('event.organizer = :organizerId', { organizerId })
        .andWhere('status.name = :paidStatus', { paidStatus: 'Оплачен' })
        .select('event.id', 'eventId')
        .addSelect('event.title', 'eventTitle')
        .addSelect('SUM(order.totalAmount)', 'revenue')
        .groupBy('event.id')
        .addGroupBy('event.title')
        .orderBy('revenue', 'DESC')
        .limit(5)
        .getRawMany();
    }

    // 5. График продаж
    const salesByDayQuery = baseQuery()
      .andWhere('status.name = :paidStatus', { paidStatus: 'Оплачен' })
      .andWhere('order.createdAt >= :date', {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })
      .select("TO_CHAR(order.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(order.id)', 'ordersCount')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .groupBy("TO_CHAR(order.createdAt, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC');

    const salesByDay = await salesByDayQuery.getRawMany();

    return {
      summary: {
        totalRevenue: parseFloat(paidRevenue?.totalRevenue || '0'),
        totalTicketsSold: parseInt(paidTickets?.totalTicketsSold || '0', 10),
        potentialRevenue: parseFloat(pendingRevenue?.potentialRevenue || '0'), // НОВОЕ
        pendingTickets: parseInt(pendingTicketsStats?.pendingTickets || '0', 10), // НОВОЕ
      },
      attendance: {
        totalTickets,
        attendedTickets,
        attendanceRate:
          totalTickets > 0
            ? ((attendedTickets / totalTickets) * 100).toFixed(1) + '%'
            : '0%',
      },
      topEvents: topEvents.map((e) => ({
        eventId: e.eventId,
        title: e.eventTitle,
        revenue: parseFloat(e.revenue || '0'),
      })),
      salesByDay: salesByDay.map((d) => ({
        date: d.date,
        ordersCount: parseInt(d.ordersCount, 10),
        revenue: parseFloat(d.revenue || '0'),
      })),
    };
  }

  // Аналитика для Администратора
  async getAdminDashboard() {
    // 1. Общее количество пользователей (по ролям)
    const usersStats = await this.userRepo
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const totalUsers = usersStats.reduce(
      (acc, curr) => acc + parseInt(curr.count, 10),
      0,
    );
    const usersByRole = usersStats.reduce((acc, curr) => {
      acc[curr.role] = parseInt(curr.count, 10);
      return acc;
    }, {});

    // 2. Количество событий (по статусам)
    const eventsStats = await this.eventRepo
      .createQueryBuilder('event')
      .leftJoin('event.status', 'status')
      .select('status.name', 'status')
      .addSelect('COUNT(event.id)', 'count')
      .groupBy('status.name')
      .getRawMany();

    const totalEvents = eventsStats.reduce(
      (acc, curr) => acc + parseInt(curr.count, 10),
      0,
    );
    const eventsByStatus = eventsStats.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.count, 10);
      return acc;
    }, {});

    // 3. Популярные категории (по количеству одобренных событий)
    const topCategories = await this.eventRepo
      .createQueryBuilder('event')
      .leftJoin('event.category', 'category')
      .leftJoin('event.status', 'status')
      .where('status.name = :status', { status: 'Одобрено' })
      .select('category.name', 'categoryName')
      .addSelect('COUNT(event.id)', 'eventsCount')
      .groupBy('category.name')
      .orderBy('eventsCount', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      users: {
        total: totalUsers,
        byRole: usersByRole,
      },
      events: {
        total: totalEvents,
        byStatus: eventsByStatus,
      },
      topCategories: topCategories.map((c) => ({
        category: c.categoryName,
        eventsCount: parseInt(c.eventsCount, 10),
      })),
    };
  }
}
