import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Promocode } from '../tickets/entities/promocode.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreatePromocodeDto } from './dto/create-promocode.dto.js';

@Injectable()
export class PromocodesService {
  constructor(
    @InjectRepository(Promocode) private promocodeRepo: Repository<Promocode>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
  ) {}

  // 1. Создать промокод
  async create(dto: CreatePromocodeDto, user: User) {
    const event = await this.eventRepo.findOne({
      where: { id: dto.eventId },
      relations: { organizer: { user: true } },
    });

    if (!event) throw new NotFoundException('Событие не найдено');
    if (event.organizer.user.id !== user.id) {
      throw new ForbiddenException(
        'Вы не можете создавать промокоды для чужого события',
      );
    }

    //Проверка скидки
    if (dto.discountType === 'percent' && dto.discountValue > 100) {
      throw new BadRequestException(
        'Процентная скидка не может превышать 100%',
      );
    }

    //Проверка дат
    if (dto.validFrom && dto.validTo) {
      const from = new Date(dto.validFrom);
      const to = new Date(dto.validTo);
      if (from >= to) {
        throw new BadRequestException(
          'Дата окончания должна быть позже даты начала',
        );
      }
    }

    const existing = await this.promocodeRepo.findOneBy({
      code: dto.code.toUpperCase(),
      event: { id: dto.eventId },
    });
    if (existing) {
      throw new BadRequestException(
        'Промокод с таким названием уже существует для этого события',
      );
    }

    const promocode = this.promocodeRepo.create({
      code: dto.code.toUpperCase(),
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      usageLimit: dto.usageLimit,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validTo: dto.validTo ? new Date(dto.validTo) : undefined,
      event,
    });

    await this.promocodeRepo.save(promocode);
    return { message: 'Промокод успешно создан', promocode };
  }

  // 2. Получить промокоды события
  async findByEvent(eventId: number, user: User) {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: { organizer: { user: true } },
    });

    if (!event) throw new NotFoundException('Событие не найдено');
    if (event.organizer.user.id !== user.id) {
      throw new ForbiddenException('Нет доступа к промокодам этого события');
    }

    return this.promocodeRepo.find({
      where: { event: { id: eventId } },
      order: { createdAt: 'DESC' },
    });
  }

  // 3. Удалить промокод
  async remove(promocodeId: number, user: User) {
    const promocode = await this.promocodeRepo.findOne({
      where: { id: promocodeId },
      relations: { event: { organizer: { user: true } } },
    });

    if (!promocode) throw new NotFoundException('Промокод не найден');
    if (promocode.event.organizer.user.id !== user.id) {
      throw new ForbiddenException('Вы не можете удалять чужие промокоды');
    }

    if (promocode.usedCount > 0) {
      throw new BadRequestException(
        'Нельзя удалить промокод, который уже использовался. Вы можете деактивировать его, изменив лимит.',
      );
    }

    await this.promocodeRepo.remove(promocode);
    return { message: 'Промокод удален' };
  }

  async validateCode(code: string, eventId: number) {
    const promocode = await this.promocodeRepo.findOneBy({
      code: code.trim().toUpperCase(),
      event: { id: eventId },
    });

    if (!promocode) {
      throw new NotFoundException('Промокод не найден');
    }

    const now = new Date();
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
      throw new BadRequestException('Лимит использований исчерпан');
    }

    return {
      valid: true,
      code: promocode.code,
      discountType: promocode.discountType,
      discountValue: promocode.discountValue,
    };
  }
}
