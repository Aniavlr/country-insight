import * as ExcelJS from 'exceljs';
import * as bwipjs from 'bwip-js';
import * as fs from 'fs';
import * as path from 'path';

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';

import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { ETicket } from './entities/e-ticket.entity.js';
import { EventTicketType } from './entities/event-ticket-type.entity.js';
import { Promocode } from './entities/promocode.entity.js';
import { OrderStatus } from '../dictionaries/entities/order-status.entity.js';
import { ETicketStatus } from '../dictionaries/entities/e-ticket-status.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { User } from '../users/entities/user.entity.js';
import { RefundRequest } from './entities/refund-request.entity.js';
import { Reminder } from '../interaction/entities/reminder.entity.js';
import { ReminderType } from '../dictionaries/entities/reminder-type.entity.js';

import { CreateOrderDto } from './dto/create-order.dto.js';
import { AddGuestDto } from './dto/add-guest.dto.js';
import { CreateRefundDto } from './dto/create-refund.dto.js';

import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(ETicket) private eTicketRepo: Repository<ETicket>,
    @InjectRepository(EventTicketType)
    private ticketTypeRepo: Repository<EventTicketType>,
    @InjectRepository(Promocode) private promocodeRepo: Repository<Promocode>,
    @InjectRepository(OrderStatus)
    private orderStatusRepo: Repository<OrderStatus>,
    @InjectRepository(ETicketStatus)
    private eTicketStatusRepo: Repository<ETicketStatus>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    private dataSource: DataSource,
    @InjectRepository(RefundRequest)
    private refundRepo: Repository<RefundRequest>,
    private notificationsService: NotificationsService,
    @InjectRepository(Reminder) private reminderRepo: Repository<Reminder>,
    @InjectRepository(ReminderType)
    private reminderTypeRepo: Repository<ReminderType>,
  ) {}

  // 1. Бронирование билета (Создание заказа)
  async createOrder(dto: CreateOrderDto, user: User) {
    const ticketType = await this.ticketTypeRepo.findOne({
      where: { id: dto.ticketTypeId },
      relations: { event: { status: true } },
    });

    if (!ticketType) throw new NotFoundException('Тип билета не найден');
    if (ticketType.event.id !== dto.eventId) {
      throw new BadRequestException('Билет не относится к этому событию');
    }

    // Проверка статуса события
    if (ticketType.event.status.name !== 'Одобрено') {
      throw new BadRequestException(
        'Билеты на это событие пока недоступны (не одобрено или отменено)',
      );
    }

    const now = new Date();
    if (ticketType.salesStartDate && ticketType.salesStartDate > now) {
      throw new BadRequestException('Продажи еще не начались');
    }
    if (ticketType.salesEndDate && ticketType.salesEndDate < now) {
      throw new BadRequestException('Продажи уже закончились');
    }

    // Проверка лимита билетов на одного пользователя
    if (ticketType.limitPerUser > 0) {
      const userTicketsCount = await this.orderItemRepo
        .createQueryBuilder('item')
        .leftJoin('item.order', 'order')
        .leftJoin('order.status', 'status')
        .where('item.ticketType = :id', { id: ticketType.id })
        .andWhere('order.user = :userId', { userId: user.id })
        .andWhere('status.name NOT IN (:...ignoredStatuses)', {
          ignoredStatuses: ['Отменён', 'Возврат'],
        })
        .select('SUM(item.quantity)', 'sum')
        .getRawOne();

      const alreadyBought = parseInt(userTicketsCount?.sum || '0', 10);
      if (alreadyBought + dto.quantity > ticketType.limitPerUser) {
        throw new BadRequestException(
          `Вы не можете купить больше ${ticketType.limitPerUser} билетов. У вас уже куплено: ${alreadyBought}`,
        );
      }
    }

    // Проверяем, сколько всего уже продано
    const totalSoldCount = await this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .leftJoin('order.status', 'status')
      .where('item.ticketType = :id', { id: ticketType.id })
      .andWhere('status.name NOT IN (:...ignoredStatuses)', {
        ignoredStatuses: ['Отменён', 'Возврат'],
      })
      .select('SUM(item.quantity)', 'sum')
      .getRawOne();

    const totalSold = parseInt(totalSoldCount?.sum || '0', 10);
    if (totalSold + dto.quantity > ticketType.totalQuantity) {
      throw new BadRequestException('Недостаточно билетов на это событие');
    }

    // Считаем скидку и проверяем промокод
    let discount = 0;
    let promocode: Promocode | null = null;
    if (dto.promocode) {
      promocode = await this.promocodeRepo.findOneBy({
        code: dto.promocode.trim().toUpperCase(),
        event: { id: dto.eventId },
      });
      if (!promocode) {
        throw new BadRequestException(
          'Промокод не найден или не подходит к этому событию',
        );
      }
      if (promocode.validFrom && promocode.validFrom > now) {
        throw new BadRequestException('Срок действия промокода еще не начался');
      }
      if (promocode.validTo && promocode.validTo < now) {
        throw new BadRequestException('Срок действия промокода истек');
      }
      if (
        promocode.usageLimit > 0 &&
        promocode.usedCount >= promocode.usageLimit
      ) {
        throw new BadRequestException('Лимит использований промокода исчерпан');
      }

      if (promocode.discountType === 'percent') {
        discount =
          ticketType.price * dto.quantity * (promocode.discountValue / 100);
      } else {
        discount = promocode.discountValue;
      }
    }

    const totalAmount = Math.max(0, ticketType.price * dto.quantity - discount);
    const isFree = totalAmount === 0;

    const targetOrderStatus = await this.orderStatusRepo.findOneBy({
      name: isFree ? 'Оплачен' : 'Ожидает оплаты',
    });
    const targetTicketStatus = await this.eTicketStatusRepo.findOneBy({
      name: isFree ? 'Активен' : 'Ожидает оплаты',
    });

    if (!targetOrderStatus || !targetTicketStatus) {
      throw new NotFoundException('Необходимые статусы не найдены в БД');
    }

    // Транзакция создания заказа и билетов
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedOrder: Order;

    try {
      const order = this.orderRepo.create({
        user,
        event: ticketType.event,
        status: targetOrderStatus,
        totalAmount,
        promocode: promocode || undefined,
        paidAt: isFree ? new Date() : undefined,
      });
      savedOrder = await queryRunner.manager.save(order);

      const orderItem = this.orderItemRepo.create({
        order: savedOrder,
        ticketType,
        quantity: dto.quantity,
        pricePerUnit: ticketType.price,
      });
      await queryRunner.manager.save(orderItem);

      const holderName =
        (dto as any).holderName || user.profile?.firstName || 'Гость';
      const holderEmail = (dto as any).holderEmail || user.email;

      for (let i = 0; i < dto.quantity; i++) {
        const ticketCode = this.generateTicketCode();
        const barcodeUrl = await this.generateBarcodeImage(ticketCode);

        const eTicket = this.eTicketRepo.create({
          orderItem,
          code: ticketCode,
          holderName,
          holderEmail,
          status: targetTicketStatus,
          barcodeUrl,
        });
        await queryRunner.manager.save(eTicket);
      }

      if (promocode) {
        promocode.usedCount += 1;
        await queryRunner.manager.save(promocode);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Ошибка при создании заказа');
    } finally {
      await queryRunner.release();
    }

    // Отправка уведомления и создание напоминаний (после успешной транзакции)
    try {
      await this.notificationsService.create(
        user.id,
        `Вы успешно забронировали билеты на событие "${ticketType.event.title}". Ждем вас!`,
        'Билет',
      );

      const eventDate = new Date(ticketType.event.startDate);
      const reminderTypes = await this.reminderTypeRepo.find();
      const type24h = reminderTypes.find((t) => t.name === 'За 24 часа');
      const type1h = reminderTypes.find((t) => t.name === 'За 1 час');

      if (type24h) {
        const remindAt = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
        if (remindAt > new Date()) {
          await this.reminderRepo.save(
            this.reminderRepo.create({
              user: { id: user.id } as User,
              event: ticketType.event,
              type: type24h,
              remindAt,
            }),
          );
        }
      }

      if (type1h) {
        const remindAt = new Date(eventDate.getTime() - 60 * 60 * 1000);
        if (remindAt > new Date()) {
          await this.reminderRepo.save(
            this.reminderRepo.create({
              user: { id: user.id } as User,
              event: ticketType.event,
              type: type1h,
              remindAt,
            }),
          );
        }
      }
    } catch (notifyErr: any) {
      this.logger.warn(
        `Заказ #${savedOrder.id} создан, но не удалось создать уведомление/напоминание: ${notifyErr.message}`,
      );
    }

    return {
      message: isFree
        ? 'Заказ успешно оформлен (бесплатно)'
        : 'Заказ создан. Билеты ожидают оплаты на входе.',
      orderId: savedOrder.id,
      totalAmount,
    };
  }

  // Вспомогательный метод генерации кода
  private generateTicketCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CI-';
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // 2. Мои билеты
  async getMyTickets(userId: number, type?: 'upcoming' | 'past' | 'cancelled') {
    const query = this.eTicketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.status', 'status')
      .leftJoinAndSelect('ticket.orderItem', 'item')
      .leftJoinAndSelect('item.ticketType', 'ticketType')
      .leftJoinAndSelect('item.order', 'order')
      .leftJoinAndSelect('order.event', 'event')
      .leftJoinAndSelect('event.locations', 'locations')
      .leftJoinAndSelect('order.status', 'orderStatus')
      .where('order.user = :userId', { userId });

    if (type === 'cancelled') {
      query.andWhere(
        '(status.name = :cancelled OR orderStatus.name = :cancelled)',
        { cancelled: 'Отменён' },
      );
    } else if (type === 'upcoming') {
      query
        .andWhere('event.startDate > :now', { now: new Date() })
        .andWhere('status.name != :cancelled', { cancelled: 'Отменён' })
        .andWhere('orderStatus.name != :cancelled', { cancelled: 'Отменён' });
    } else if (type === 'past') {
      query
        .andWhere('event.startDate <= :now', { now: new Date() })
        .andWhere('status.name != :cancelled', { cancelled: 'Отменён' })
        .andWhere('orderStatus.name != :cancelled', { cancelled: 'Отменён' });
    }

    return query.orderBy('event.startDate', 'DESC').getMany();
  }

  // Общий метод для гашения билета
  private async markTicketAsUsed(ticket: ETicket) {
    const usedStatus = await this.eTicketStatusRepo.findOneBy({
      name: 'Использован',
    });
    const paidOrderStatus = await this.orderStatusRepo.findOneBy({
      name: 'Оплачен',
    });
    const activeTicketStatus = await this.eTicketStatusRepo.findOneBy({
      name: 'Активен',
    });

    if (!usedStatus || !paidOrderStatus || !activeTicketStatus) {
      throw new NotFoundException('Необходимые статусы не найдены в БД');
    }

    ticket.isUsed = true;
    ticket.usedAt = new Date();
    ticket.status = usedStatus;
    await this.eTicketRepo.save(ticket);

    const order = ticket.orderItem.order;
    if (order.status.name === 'Ожидает оплаты') {
      order.status = paidOrderStatus;
      order.paidAt = new Date();
      order.paidMarkedBy = ticket.orderItem.ticketType.event.organizer;
      await this.orderRepo.save(order);

      // Обновляем остальные билеты в этом же заказе (кроме текущего)
      const otherTickets = await this.eTicketRepo.find({
        where: { orderItem: { order: { id: order.id } } },
        relations: { status: true },
      });

      for (const other of otherTickets) {
        if (other.id !== ticket.id && other.status.name === 'Ожидает оплаты') {
          other.status = activeTicketStatus;
          await this.eTicketRepo.save(other);
        }
      }
    }

    return {
      message: 'Билет успешно погашен',
      holderName: ticket.holderName,
      code: ticket.code,
    };
  }

  // 3. Отметка по коду
  async validateTicket(code: string, user: User) {
    const ticket = await this.eTicketRepo.findOne({
      where: { code },
      relations: {
        status: true,
        orderItem: {
          ticketType: { event: { organizer: { user: true } } },
          order: { status: true },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Билет с таким кодом не найден');
    if (ticket.orderItem.ticketType.event.organizer.user.id !== user.id) {
      throw new ForbiddenException(
        'Вы не можете отмечать билеты на чужое событие',
      );
    }
    if (ticket.status.name === 'Отменён') {
      throw new BadRequestException('Этот билет был отменён (возврат)');
    }
    if (ticket.isUsed) {
      throw new BadRequestException(
        `Билет уже использован ${ticket.usedAt?.toLocaleString()}`,
      );
    }

    return this.markTicketAsUsed(ticket);
  }

  // 4. Отметка по ID
  async validateTicketById(ticketId: number, user: User) {
    const ticket = await this.eTicketRepo.findOne({
      where: { id: ticketId },
      relations: {
        status: true,
        orderItem: {
          ticketType: { event: { organizer: { user: true } } },
          order: { status: true },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Билет не найден');
    if (ticket.orderItem.ticketType.event.organizer.user.id !== user.id) {
      throw new ForbiddenException(
        'Вы не можете отмечать билеты на чужое событие',
      );
    }
    if (ticket.status.name === 'Отменён') {
      throw new BadRequestException('Этот билет был отменён (возврат)');
    }
    if (ticket.isUsed) {
      throw new BadRequestException(
        `Билет уже использован ${ticket.usedAt?.toLocaleString()}`,
      );
    }

    return this.markTicketAsUsed(ticket);
  }

  // 5. Ручное добавление гостя
  async addGuestManually(dto: AddGuestDto, user: User) {
    const ticketType = await this.ticketTypeRepo.findOne({
      where: { id: dto.ticketTypeId },
      relations: { event: { organizer: { user: true } } },
    });

    if (!ticketType) throw new NotFoundException('Тип билета не найден');
    if (ticketType.event.organizer.user.id !== user.id) {
      throw new ForbiddenException(
        'Вы не можете добавлять гостей на чужое событие',
      );
    }

    const paidOrderStatus = await this.orderStatusRepo.findOneBy({
      name: 'Оплачен',
    });
    const activeTicketStatus = await this.eTicketStatusRepo.findOneBy({
      name: 'Активен',
    });

    if (!paidOrderStatus || !activeTicketStatus) {
      throw new NotFoundException('Необходимые статусы не найдены в БД');
    }

    const quantity = (dto as any).quantity || 1;

    const order = this.orderRepo.create({
      user,
      event: ticketType.event,
      status: paidOrderStatus,
      totalAmount: 0,
      paidAt: new Date(),
    });
    await this.orderRepo.save(order);

    const orderItem = this.orderItemRepo.create({
      order,
      ticketType,
      quantity,
      pricePerUnit: 0,
    });
    await this.orderItemRepo.save(orderItem);

    const generatedCodes: string[] = [];

    for (let i = 0; i < quantity; i++) {
      const ticketCode = this.generateTicketCode();
      const barcodeUrl = await this.generateBarcodeImage(ticketCode);

      const eTicket = this.eTicketRepo.create({
        orderItem,
        code: ticketCode,
        holderName: dto.holderName,
        holderEmail: dto.holderEmail,
        isManuallyAdded: true,
        status: activeTicketStatus,
        barcodeUrl,
      });
      await this.eTicketRepo.save(eTicket);
      generatedCodes.push(ticketCode);
    }

    return {
      message: 'Гость успешно добавлен',
      ticketCode: generatedCodes[0],
      ticketCodes: generatedCodes,
    };
  }

  // 6. Экспорт в Excel
  async exportGuests(eventId: number, user: User) {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: { organizer: { user: true } },
    });

    if (!event) throw new NotFoundException('Событие не найдено');
    if (event.organizer.user.id !== user.id) {
      throw new ForbiddenException('Нет доступа');
    }

    const tickets = await this.eTicketRepo.find({
      where: { orderItem: { ticketType: { event: { id: eventId } } } },
      relations: { orderItem: { ticketType: true }, status: true },
      order: { createdAt: 'ASC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Гости');

    worksheet.columns = [
      { header: 'Код билета', key: 'code', width: 20 },
      { header: 'Имя гостя', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Тип билета', key: 'type', width: 15 },
      { header: 'Статус билета', key: 'status', width: 15 },
      { header: 'Добавлен вручную', key: 'manual', width: 15 },
      { header: 'Пришел?', key: 'isUsed', width: 10 },
    ];

    tickets.forEach((t) => {
      worksheet.addRow({
        code: t.code,
        name: t.holderName,
        email: t.holderEmail,
        type: t.orderItem.ticketType.name,
        status: t.status.name,
        manual: t.isManuallyAdded ? 'Да' : 'Нет',
        isUsed: t.isUsed ? 'Да' : 'Нет',
      });
    });

    return workbook.xlsx.writeBuffer();
  }

  // 7. Генерация картинки штрих-кода
  private async generateBarcodeImage(code: string): Promise<string> {
    const pngBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: code,
      scale: 3,
      height: 15,
      includetext: true,
      textxalign: 'center',
    });

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filename = `barcode-${code}.png`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, pngBuffer);

    return `/uploads/${filename}`;
  }

  // 8. Запрос на возврат
  async requestRefund(dto: CreateRefundDto, user: User) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId, user: { id: user.id } },
      relations: {
        event: { organizer: { user: true } },
        status: true,
        items: { tickets: true },
      },
    });

    if (!order) throw new NotFoundException('Заказ не найден');
    if (order.status.name === 'Возврат' || order.status.name === 'Отменён') {
      throw new BadRequestException(
        'По этому заказу уже нельзя запросить возврат',
      );
    }

    const existingRefund = await this.refundRepo.findOneBy({
      order: { id: order.id },
      status: 'pending',
    });
    if (existingRefund) {
      throw new BadRequestException('Вы уже отправили запрос на возврат');
    }

    if (order.event.startDate < new Date()) {
      throw new BadRequestException(
        'Нельзя вернуть билет на прошедшее событие',
      );
    }

    for (const item of order.items) {
      for (const ticket of item.tickets) {
        if (ticket.isUsed) {
          throw new BadRequestException(
            'Нельзя вернуть заказ, так как один из билетов уже использован',
          );
        }
      }
    }

    const refund = this.refundRepo.create({
      order,
      user,
      reason: dto.reason,
      status: 'pending',
    });
    await this.refundRepo.save(refund);

    // Уведомляем организатора о новом запросе на возврат
    try {
      await this.notificationsService.create(
        order.event.organizer.user.id,
        `Поступил новый запрос на возврат по заказу #${order.id} (событие "${order.event.title}").`,
        'Возврат',
      );
    } catch (notifyErr: any) {
      this.logger.warn(
        `Не удалось уведомить организатора о возврате #${refund.id}: ${notifyErr.message}`,
      );
    }

    return {
      message: 'Запрос на возврат отправлен организатору',
      refundId: refund.id,
    };
  }

  // 9. Обработка возврата (Организатор)
  async processRefund(
    refundId: number,
    action: 'approve' | 'reject',
    user: User,
  ) {
    const refund = await this.refundRepo.findOne({
      where: { id: refundId },
      relations: {
        user: true,
        order: {
          event: { organizer: { user: true } },
          status: true,
          items: { tickets: true },
        },
      },
    });

    if (!refund) throw new NotFoundException('Запрос на возврат не найден');
    if (refund.order.event.organizer.user.id !== user.id) {
      throw new ForbiddenException(
        'Вы не можете обрабатывать возвраты чужого события',
      );
    }
    if (refund.status !== 'pending') {
      throw new BadRequestException('Этот запрос уже обработан');
    }

    if (action === 'approve') {
      refund.status = 'approved';

      const refundedOrderStatus = await this.orderStatusRepo.findOneBy({
        name: 'Возврат',
      });
      refund.order.status = refundedOrderStatus!;
      await this.orderRepo.save(refund.order);

      const cancelledTicketStatus = await this.eTicketStatusRepo.findOneBy({
        name: 'Отменён',
      });
      for (const item of refund.order.items) {
        for (const ticket of item.tickets) {
          ticket.status = cancelledTicketStatus!;
          await this.eTicketRepo.save(ticket);
        }
      }

      // Удаляем неотправленные напоминания по этому событию
      await this.reminderRepo.delete({
        user: { id: refund.user.id },
        event: { id: refund.order.event.id },
        sentAt: IsNull(),
      });

      await this.notificationsService.create(
        refund.user.id,
        `Ваш запрос на возврат билетов на событие "${refund.order.event.title}" одобрен.`,
        'Возврат',
      );
    } else {
      refund.status = 'rejected';
      await this.notificationsService.create(
        refund.user.id,
        `Ваш запрос на возврат билетов на событие "${refund.order.event.title}" отклонён организатором.`,
        'Возврат',
      );
    }

    await this.refundRepo.save(refund);

    return {
      message: `Запрос на возврат ${action === 'approve' ? 'одобрен' : 'отклонён'}`,
    };
  }

  // 10. Список гостей (JSON)
  async getEventGuests(eventId: number, user: User) {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: { organizer: { user: true } },
    });

    if (!event) throw new NotFoundException('Событие не найдено');
    if (event.organizer.user.id !== user.id) {
      throw new ForbiddenException('Нет доступа к этому событию');
    }

    const tickets = await this.eTicketRepo.find({
      where: { orderItem: { ticketType: { event: { id: eventId } } } },
      relations: {
        orderItem: { ticketType: true, order: { user: { profile: true } } },
        status: true,
      },
      order: { createdAt: 'ASC' },
    });

    return tickets.map((t) => ({
      ticketId: t.id,
      code: t.code,
      holderName: t.holderName,
      holderEmail: t.holderEmail,
      ticketType: t.orderItem.ticketType.name,
      status: t.status.name,
      isUsed: t.isUsed,
      usedAt: t.usedAt,
      isManuallyAdded: t.isManuallyAdded,
      buyerName: t.orderItem.order.user?.profile?.firstName || 'Неизвестно',
      buyerEmail: t.orderItem.order.user?.email || 'Неизвестно',
      barcodeUrl: t.barcodeUrl,
    }));
  }
}
