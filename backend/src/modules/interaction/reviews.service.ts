import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { User } from '../users/entities/user.entity.js';
import { ReviewPhoto } from './entities/review-photo.entity.js';
import { ETicket } from '../tickets/entities/e-ticket.entity.js';

import { CreateReviewDto } from './dto/create-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(ReviewPhoto) private photoRepo: Repository<ReviewPhoto>,
    @InjectRepository(ETicket) private eTicketRepo: Repository<ETicket>,
  ) {}

  async create(dto: CreateReviewDto, userId: number) {
    const event = await this.eventRepo.findOneBy({ id: dto.eventId });
    if (!event) throw new NotFoundException('Событие не найдено');

    const attendedTicket = await this.eTicketRepo.findOne({
      where: {
        isUsed: true,
        orderItem: {
          ticketType: { event: { id: dto.eventId } },
          order: { user: { id: userId } },
        },
      },
    });

    if (!attendedTicket) {
      throw new BadRequestException(
        'Вы можете оставить отзыв только после посещения события',
      );
    }

    const existing = await this.reviewRepo.findOne({
      where: { event: { id: dto.eventId }, user: { id: userId } },
    });
    if (existing)
      throw new BadRequestException('Вы уже оставили отзыв на это событие');

    const review = this.reviewRepo.create({
      event,
      user: { id: userId } as User,
      rating: dto.rating,
      text: dto.text,
    });
    await this.reviewRepo.save(review);

    if (dto.photoUrls && dto.photoUrls.length > 0) {
      const photos = dto.photoUrls
        .slice(0, 5)
        .map((url) => this.photoRepo.create({ review, url }));
      await this.photoRepo.save(photos);
    }

    return { message: 'Отзыв успешно добавлен', reviewId: review.id };
  }

  async findByEvent(eventId: number) {
    const reviews = await this.reviewRepo.find({
      where: { event: { id: eventId } },
      relations: { user: { profile: true }, photos: true },
      order: { createdAt: 'DESC' },
    });

    const totalReviews = reviews.length;

    let averageRating = 0;
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = parseFloat((sum / totalReviews).toFixed(1)); // Округляем до 1 знака
    }

    return {
      averageRating,
      totalReviews,
      reviews,
    };
  }
}
