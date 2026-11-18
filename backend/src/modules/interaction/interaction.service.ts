import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Favorite } from './entities/favorite.entity.js';
import { Complaint } from './entities/complaint.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Review } from './entities/review.entity.js';
import { CreateComplaintDto } from './dto/create-complaint.dto.js';

@Injectable()
export class InteractionService {
  constructor(
    @InjectRepository(Favorite) private favoriteRepo: Repository<Favorite>,
    @InjectRepository(Complaint) private complaintRepo: Repository<Complaint>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
  ) {}

  //ИЗБРАННОЕ
  async addToFavorites(eventId: number, userId: number) {
    const event = await this.eventRepo.findOneBy({ id: eventId });
    if (!event) throw new NotFoundException('Событие не найдено');

    const existing = await this.favoriteRepo.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
    });
    if (existing) throw new BadRequestException('Событие уже в избранном');

    const favorite = this.favoriteRepo.create({
      event,
      user: { id: userId } as User,
    });
    await this.favoriteRepo.save(favorite);
    return { message: 'Добавлено в избранное' };
  }

  async getMyFavorites(userId: number) {
    return this.favoriteRepo.find({
      where: { user: { id: userId } },
      relations: { event: { locations: true, city: true, category: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async removeFromFavorites(eventId: number, userId: number) {
    const favorite = await this.favoriteRepo.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
    });
    if (!favorite)
      throw new NotFoundException('Событие не найдено в избранном');
    await this.favoriteRepo.remove(favorite);
    return { message: 'Удалено из избранного' };
  }

  //ЖАЛОБЫ
  async createComplaint(dto: CreateComplaintDto, userId: number) {
    if (!dto.reviewId && !dto.eventId) {
      throw new BadRequestException('Укажите ID отзыва или ID события');
    }
    if (dto.reviewId && dto.eventId) {
      throw new BadRequestException(
        'Выберите что-то одно: либо отзыв, либо событие',
      );
    }

    // Проверка существования и защита от жалобы на себя
    if (dto.reviewId) {
      const review = await this.reviewRepo.findOne({
        where: { id: dto.reviewId },
        relations: { user: true },
      });
      if (!review) throw new NotFoundException('Отзыв не найден');

      if (review.user.id === userId) {
        throw new BadRequestException(
          'Вы не можете пожаловаться на свой собственный отзыв',
        );
      }
    }
    if (dto.eventId) {
      const event = await this.eventRepo.findOneBy({ id: dto.eventId });
      if (!event) throw new NotFoundException('Событие не найдено');
    }

    const existingComplaint = await this.complaintRepo.findOne({
      where: {
        user: { id: userId },
        status: 'pending',
        ...(dto.reviewId ? { review: { id: dto.reviewId } } : {}),
        ...(dto.eventId ? { event: { id: dto.eventId } } : {}),
      },
    });
    if (existingComplaint) {
      throw new BadRequestException(
        'Вы уже отправили жалобу на этот объект. Дождитесь её рассмотрения.',
      );
    }

    // Создаем жалобу
    const complaint = this.complaintRepo.create({
      user: { id: userId } as User,
      reason: dto.reason,
      review: dto.reviewId ? ({ id: dto.reviewId } as any) : undefined,
      event: dto.eventId ? ({ id: dto.eventId } as any) : undefined,
      status: 'pending',
    });
    await this.complaintRepo.save(complaint);

    return { message: 'Жалоба отправлена администратору' };
  }
}
