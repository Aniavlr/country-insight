import * as bcrypt from 'bcrypt';

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { User } from './entities/user.entity.js';
import { UserProfile } from './entities/user-profile.entity.js';
import { Organizer } from './entities/organizer.entity.js';
import { Subscription } from './entities/subscription.entity.js';
import { City } from '../dictionaries/entities/city.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { Category } from '../dictionaries/entities/category.entity.js';

import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateOrganizerDto } from './dto/update-organizer.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserProfile) private profileRepo: Repository<UserProfile>,
    @InjectRepository(Organizer) private organizerRepo: Repository<Organizer>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(City) private cityRepo: Repository<City>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  // 1. Получить свой профиль
  async getMyProfile(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: {
        profile: { city: true },
        organizer: {
          city: true,
          type: true,
          verificationStatus: true,
          categories: true,
        },
      },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
    const { passwordHash, ...result } = user;
    return result;
  }

  // 2. Обновить профиль обычного пользователя
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) throw new NotFoundException('Профиль не найден');

    let city = profile.city;
    if (dto.cityId) {
      const foundCity = await this.cityRepo.findOneBy({ id: dto.cityId });
      if (!foundCity) throw new NotFoundException('Город не найден');
      city = foundCity;
    }

    Object.assign(profile, {
      firstName: dto.firstName ?? profile.firstName,
      phone: dto.phone ?? profile.phone,
      avatarUrl: dto.avatarUrl ?? profile.avatarUrl,
      emailNotifications: dto.emailNotifications ?? profile.emailNotifications,
      city,
    });

    await this.profileRepo.save(profile);
    return { message: 'Профиль обновлен', profile };
  }

  // 3. Смена пароля
  async changePassword(userId: number, dto: ChangePasswordDto) {
    // Используем QueryBuilder, чтобы достать хеш
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) throw new NotFoundException('Пользователь не найден');

    const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isMatch) throw new BadRequestException('Старый пароль неверен');

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);

    return { message: 'Пароль успешно изменен' };
  }

  // 4. Редактирование профиля организатора
  async updateOrganizerProfile(userId: number, dto: UpdateOrganizerDto) {
    const organizer = await this.organizerRepo.findOne({
      where: { user: { id: userId } },
      relations: { categories: true, city: true },
    });
    if (!organizer)
      throw new NotFoundException('Профиль организатора не найден');

    let city = organizer.city;
    if (dto.cityId) {
      const foundCity = await this.cityRepo.findOneBy({ id: dto.cityId });
      if (!foundCity) throw new NotFoundException('Город не найден');
      city = foundCity;
    }

    let categories = organizer.categories;
    if (dto.categoryIds) {
      categories = await this.categoryRepo.findBy({ id: In(dto.categoryIds) });
    }

    Object.assign(organizer, {
      name: dto.name ?? organizer.name,
      description: dto.description ?? organizer.description,
      contacts: dto.contacts ?? organizer.contacts,
      socials: dto.socials ?? organizer.socials,
      logoUrl: dto.logoUrl ?? organizer.logoUrl,
      city,
      categories,
    });

    await this.organizerRepo.save(organizer);
    return { message: 'Профиль организатора обновлен', organizer };
  }

  // 5. Публичный профиль организатора (с событиями)
  async getOrganizerPublicProfile(organizerId: number) {
    const organizer = await this.organizerRepo.findOne({
      where: { id: organizerId },
      relations: { city: true, type: true, categories: true },
    });
    if (!organizer) throw new NotFoundException('Организатор не найден');

    // 1. Подтягиваем одобренные события этого организатора
    const events = await this.eventRepo.find({
      where: { organizer: { id: organizerId }, status: { name: 'Одобрено' } },
      relations: { locations: true, category: true },
      order: { startDate: 'ASC' },
    });

    // 2. Считаем количество подписчиков
    const subscribersCount = await this.subscriptionRepo.count({
      where: { organizer: { id: organizerId } },
    });

    // 3. Возвращаем всё вместе
    return { organizer, events, subscribersCount };
  }

  // 6. Подписаться на организатора (с защитой от подписки на самого себя)
  async subscribe(organizerId: number, userId: number) {
    const organizer = await this.organizerRepo.findOne({
      where: { id: organizerId },
      relations: { user: true },
    });
    if (!organizer) throw new NotFoundException('Организатор не найден');

    // Проверка: не подписывается ли пользователь на самого себя
    if (organizer.user.id === userId) {
      throw new ForbiddenException('Вы не можете подписаться на самого себя');
    }

    const existing = await this.subscriptionRepo.findOne({
      where: { user: { id: userId }, organizer: { id: organizerId } },
    });
    if (existing) throw new BadRequestException('Вы уже подписаны');

    const sub = this.subscriptionRepo.create({
      user: { id: userId } as User,
      organizer,
    });
    await this.subscriptionRepo.save(sub);
    return { message: 'Вы подписались на организатора' };
  }

  // 7. Отписаться от организатора
  async unsubscribe(organizerId: number, userId: number) {
    const sub = await this.subscriptionRepo.findOne({
      where: { user: { id: userId }, organizer: { id: organizerId } },
    });
    if (!sub) throw new NotFoundException('Подписка не найдена');
    await this.subscriptionRepo.remove(sub);
    return { message: 'Вы отписались' };
  }

  // 8. Мои подписки
  async getMySubscriptions(userId: number) {
    return this.subscriptionRepo.find({
      where: { user: { id: userId } },
      relations: { organizer: { city: true, type: true } },
    });
  }
}
