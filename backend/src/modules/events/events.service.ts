import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './entities/event.entity.js';
import { EventLocation } from './entities/event-location.entity.js';
import { City } from '../dictionaries/entities/city.entity.js';
import { Category } from '../dictionaries/entities/category.entity.js';
import { Format } from '../dictionaries/entities/format.entity.js';
import { AgeLimit } from '../dictionaries/entities/age-limit.entity.js';
import { EventStatus } from '../dictionaries/entities/event-status.entity.js';
import { Organizer } from '../users/entities/organizer.entity.js';
import { EventTicketType } from '../tickets/entities/event-ticket-type.entity.js';
import { TicketType } from '../dictionaries/entities/ticket-type.entity.js';
import { EventImage } from './entities/event-image.entity.js';

import { CreateEventDto } from './dto/create-event.dto.js';
import { EventFilterDto } from './dto/event-filter.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(EventLocation)
    private locationRepo: Repository<EventLocation>,
    @InjectRepository(City) private cityRepo: Repository<City>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Format) private formatRepo: Repository<Format>,
    @InjectRepository(AgeLimit) private ageLimitRepo: Repository<AgeLimit>,
    @InjectRepository(EventStatus) private statusRepo: Repository<EventStatus>,
    @InjectRepository(Organizer) private organizerRepo: Repository<Organizer>,
    @InjectRepository(EventTicketType)
    private ticketTypeRepo: Repository<EventTicketType>,
    @InjectRepository(EventImage)
    private imageRepo: Repository<EventImage>,
    @InjectRepository(TicketType)
    private paymentTypeRepo: Repository<TicketType>,
  ) {}

  // 1. Создание события (только для организаторов)
  async create(dto: CreateEventDto, user: User) {
    const organizer = await this.organizerRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (!organizer)
      throw new ForbiddenException(
        'Только организаторы могут создавать события',
      );

    const city = await this.cityRepo.findOneBy({ id: dto.cityId });
    const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
    const status = await this.statusRepo.findOneBy({ name: 'На модерации' });

    if (!city || !category || !status)
      throw new NotFoundException('Один из справочников не найден');

    const format = dto.formatId
      ? await this.formatRepo.findOneBy({ id: dto.formatId })
      : null;
    const ageLimit = dto.ageLimitId
      ? await this.ageLimitRepo.findOneBy({ id: dto.ageLimitId })
      : null;

    // Создаем событие
    const event = this.eventRepo.create({
      title: dto.title,
      description: dto.description,
      posterUrl: dto.posterUrl,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      isRecurring: dto.isRecurring || false,
      includedInPrice: dto.includedInPrice,
      dressCode: dto.dressCode,
      bringWithYou: dto.bringWithYou,
      organizer,
      city,
      category,
      status,
      format: format || undefined,
      ageLimit: ageLimit || undefined,
    });
    await this.eventRepo.save(event);

    // Создаем локацию
    const location = this.locationRepo.create({
      address: dto.location.address,
      lat: dto.location.lat,
      lon: dto.location.lon,
      note: dto.location.note,
      event: event,
    });
    await this.locationRepo.save(location);

    // Создаем билеты, если они переданы
    if (dto.ticketTypes && dto.ticketTypes.length > 0) {
      for (const t of dto.ticketTypes) {
        const paymentType = await this.paymentTypeRepo.findOneBy({
          id: t.paymentTypeId,
        });
        if (!paymentType)
          throw new NotFoundException(
            `Тип оплаты с ID ${t.paymentTypeId} не найден`,
          );

        const ticketType = this.ticketTypeRepo.create({
          event,
          name: t.name,
          price: t.price,
          totalQuantity: t.totalQuantity,
          paymentType,
          salesStartDate: t.salesStartDate
            ? new Date(t.salesStartDate)
            : undefined,
          salesEndDate: t.salesEndDate ? new Date(t.salesEndDate) : undefined,
        });
        await this.ticketTypeRepo.save(ticketType);
      }
    }

    // Создаем галерею (не более 5 фото)
    if (dto.images && dto.images.length > 0) {
      const imagesToSave = dto.images
        .slice(0, 5)
        .map((url, index) =>
          this.imageRepo.create({ event, url, sortOrder: index }),
        );
      await this.imageRepo.save(imagesToSave);
    }
    return { message: 'Событие отправлено на модерацию', eventId: event.id };
  }

  // 2. Получение списка событий (с фильтрами)
  async findAll(filters: EventFilterDto) {
    const query = this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.city', 'city')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.format', 'format')
      .leftJoinAndSelect('event.locations', 'location')
      .leftJoinAndSelect('event.status', 'status')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('organizer.type', 'organizerType')
      .leftJoinAndSelect('event.ticketTypes', 'ticketTypes')
      .leftJoinAndSelect('event.ageLimit', 'ageLimit')
      .where('status.name = :statusName', { statusName: 'Одобрено' });

    if (!filters.period && !filters.dateFrom) {
      query.andWhere('event.endDate >= :now', { now: new Date() });
    }

    if (filters.cityId)
      query.andWhere('city.id = :cityId', { cityId: filters.cityId });
    if (filters.categoryId)
      query.andWhere('category.id = :categoryId', {
        categoryId: filters.categoryId,
      });
    if (filters.formatId)
      query.andWhere('format.id = :formatId', { formatId: filters.formatId });
    if (filters.ageLimitId)
      query.andWhere('ageLimit.id = :ageLimitId', {
        ageLimitId: filters.ageLimitId,
      });
    if (filters.organizerTypeId)
      query.andWhere('organizerType.id = :organizerTypeId', {
        organizerTypeId: filters.organizerTypeId,
      });

    // Фильтр по периоду
    if (filters.period) {
      const today = new Date();
      let start = new Date();
      let end = new Date();

      if (filters.period === 'today') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else if (filters.period === 'weekend') {
        const day = today.getDay();
        const diffToSaturday = (6 - day + 7) % 7;
        start.setDate(today.getDate() + diffToSaturday);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        end.setHours(23, 59, 59, 999);
      } else if (filters.period === 'week') {
        start = today;
        end.setDate(today.getDate() + 7);
      }
      query.andWhere('event.startDate >= :start AND event.startDate <= :end', {
        start,
        end,
      });
    }

    if (filters.dateFrom)
      query.andWhere('event.startDate >= :dateFrom', {
        dateFrom: new Date(filters.dateFrom),
      });
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      query.andWhere('event.startDate <= :dateTo', { dateTo });
    }

    if (filters.search) {
      query.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Сортировка
    if (filters.sortBy === 'popular') {
      query.orderBy('event.createdAt', 'DESC');
    } else if (filters.sortBy === 'price_asc') {
      query.orderBy('ticketTypes.price', 'ASC');
    } else if (filters.sortBy === 'price_desc') {
      query.orderBy('ticketTypes.price', 'DESC');
    } else {
      query.orderBy('event.startDate', 'ASC');
    }

    return query.getMany();
  }

  // 3. Получение одного события по ID
  async findOne(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: {
        city: true,
        category: true,
        format: true,
        ageLimit: true,
        locations: true,
        organizer: true,
        images: true,
        ticketTypes: true,
      },
    });
    if (!event) throw new NotFoundException('Событие не найдено');
    return event;
  }

  // 4. Случайное событие
  async findRandom(cityId?: number) {
    const today = new Date();
    const day = today.getDay();
    const diffToSaturday = day === 0 ? 0 : 6 - day; // если сегодня воскресенье — берём сегодня

    const start = new Date(today);
    if (day !== 0) {
      start.setDate(today.getDate() + diffToSaturday);
      start.setHours(0, 0, 0, 0);
    }

    const end = new Date(start);
    end.setDate(start.getDate() + (day === 0 ? 0 : 1));
    end.setHours(23, 59, 59, 999);

    const query = this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.city', 'city')
      .leftJoinAndSelect('event.locations', 'locations')
      .leftJoinAndSelect('event.status', 'status')
      .leftJoinAndSelect('event.ticketTypes', 'ticketTypes')
      .where('status.name = :statusName', { statusName: 'Одобрено' })
      .andWhere('event.startDate >= :start AND event.startDate <= :end', {
        start,
        end,
      });

    if (cityId) {
      query.andWhere('city.id = :cityId', { cityId });
    }

    const event = await query.orderBy('RANDOM()').getOne();
    if (!event)
      throw new NotFoundException('На ближайшие выходные событий не найдено');
    return event;
  }

  // 5. Мои события (для организатора)
  async findMyEvents(userId: number) {
    const organizer = await this.organizerRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!organizer) throw new NotFoundException('Организатор не найден');

    return this.eventRepo.find({
      where: { organizer: { id: organizer.id } },
      relations: { status: true, city: true, category: true },
      order: { createdAt: 'DESC' },
    });
  }

  // 6. Редактирование события
  async update(id: number, dto: UpdateEventDto, user: User) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: { organizer: { user: true }, status: true },
    });
    if (!event) throw new NotFoundException('Событие не найдено');

    // Проверка прав: редактировать может только владелец-организатор
    if (event.organizer.user.id !== user.id) {
      throw new ForbiddenException('Вы не можете редактировать чужое событие');
    }

    // Ограничение: если событие уже одобрено, нельзя менять дату и место (только текст)
    // Для простоты в дипломе: разрешаем менять всё, пока статус "На модерации"
    if (event.status.name === 'Одобрено') {
      delete dto.startDate;
      delete dto.endDate;
      delete dto.cityId;
      delete dto.location; // Запрещаем менять дату и место
    }

    if (event.status.name !== 'Одобрено') {
      if (dto.startDate) event.startDate = new Date(dto.startDate);
      if (dto.endDate) event.endDate = new Date(dto.endDate);
      if (dto.isRecurring !== undefined) event.isRecurring = dto.isRecurring;
      if (dto.cityId) event.city = { id: dto.cityId } as City;
      if (dto.categoryId) event.category = { id: dto.categoryId } as Category;
      if (dto.formatId) event.format = { id: dto.formatId } as Format;
      if (dto.ageLimitId) event.ageLimit = { id: dto.ageLimitId } as AgeLimit;
    }

    Object.assign(event, {
      title: dto.title ?? event.title,
      description: dto.description ?? event.description,
      posterUrl: dto.posterUrl ?? event.posterUrl,
      includedInPrice: dto.includedInPrice ?? event.includedInPrice,
      dressCode: dto.dressCode ?? event.dressCode,
      bringWithYou: dto.bringWithYou ?? event.bringWithYou,
    });

    await this.eventRepo.save(event);

    // Если меняли локацию
    if (dto.location) {
      await this.locationRepo.update(
        { event: { id: event.id } },
        {
          address: dto.location.address,
          lat: dto.location.lat,
          lon: dto.location.lon,
          note: dto.location.note,
        },
      );
    }

    return { message: 'Событие обновлено', event };
  }

  // 7. Отмена события
  async cancel(id: number, user: User) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: { organizer: { user: true } },
    });
    if (!event) throw new NotFoundException('Событие не найдено');
    if (event.organizer.user.id !== user.id)
      throw new ForbiddenException('Нет прав');

    const cancelledStatus = await this.statusRepo.findOneBy({
      name: 'Отменено',
    });
    if (!cancelledStatus)
      throw new NotFoundException('Статус "Отменено" не найден');

    event.status = cancelledStatus;
    await this.eventRepo.save(event);
    return { message: 'Событие отменено' };
  }

  // 8. Модерация (для Админа)
  async updateStatus(id: number, statusId: number) {
    const event = await this.eventRepo.findOneBy({ id });
    if (!event) throw new NotFoundException('Событие не найдено');
    const status = await this.statusRepo.findOneBy({ id: statusId });
    if (!status) throw new NotFoundException('Статус не найден');

    event.status = status;
    await this.eventRepo.save(event);
    return { message: `Статус изменен на ${status.name}` };
  }

  async findPending() {
    return this.eventRepo.find({
      where: { status: { name: 'На модерации' } },
      relations: {
        organizer: true,
        city: true,
        category: true,
        locations: true,
      },
      order: { createdAt: 'ASC' }, // старые заявки проверяются первыми
    });
  }
}
