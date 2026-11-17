import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../users/entities/user.entity.js';
import { Organizer } from '../users/entities/organizer.entity.js';
import { Complaint } from '../interaction/entities/complaint.entity.js';
import { VerificationStatus } from '../dictionaries/entities/verification-status.entity.js';
import { Review } from '../interaction/entities/review.entity.js';

import { ChangeRoleDto } from './dto/change-role.dto.js';
import { ProcessComplaintDto } from './dto/process-complaint.dto.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Organizer) private organizerRepo: Repository<Organizer>,
    @InjectRepository(Complaint) private complaintRepo: Repository<Complaint>,
    @InjectRepository(VerificationStatus)
    private verifStatusRepo: Repository<VerificationStatus>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
  ) {}

  // 1. Список всех пользователей
  async getAllUsers() {
    const users = await this.userRepo.find({
      relations: { profile: true, organizer: true },
      order: { createdAt: 'DESC' },
    });
    // Скрываем пароли
    return users.map((u) => {
      const { passwordHash, ...result } = u;
      return result;
    });
  }

  // 2. Блокировка / разблокировка пользователя
  async toggleBlockUser(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Нельзя заблокировать администратора');
    }

    user.isBlocked = !user.isBlocked;
    await this.userRepo.save(user);

    return {
      message: `Пользователь ${user.isBlocked ? 'заблокирован' : 'разблокирован'}`,
      isBlocked: user.isBlocked,
    };
  }

  // 3. Смена роли пользователя
  async changeUserRole(
    userId: number,
    dto: ChangeRoleDto,
    currentAdminId: number,
  ) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Защита 1: Нельзя менять роль самому себе
    if (user.id === currentAdminId) {
      throw new ForbiddenException('Вы не можете изменить роль самому себе');
    }

    // Защита 2: Нельзя снять роль ADMIN с последнего администратора
    if (user.role === UserRole.ADMIN && dto.role !== UserRole.ADMIN) {
      const adminsCount = await this.userRepo.count({
        where: { role: UserRole.ADMIN },
      });
      if (adminsCount <= 1) {
        throw new ForbiddenException(
          'В системе должен остаться хотя бы один администратор',
        );
      }
    }

    user.role = dto.role;
    await this.userRepo.save(user);
    return { message: `Роль изменена на ${dto.role}`, role: user.role };
  }

  // 4. Список организаторов на верификации
  async getPendingOrganizers() {
    return this.organizerRepo.find({
      where: { verificationStatus: { name: 'На проверке' } },
      relations: { user: true, city: true, type: true },
      order: { createdAt: 'ASC' },
    });
  }

  // 5. Одобрить / Отклонить организатора
  async verifyOrganizer(
    organizerId: number,
    statusName: 'Одобрен' | 'Отклонён',
  ) {
    const organizer = await this.organizerRepo.findOneBy({ id: organizerId });
    if (!organizer) throw new NotFoundException('Организатор не найден');

    const status = await this.verifStatusRepo.findOneBy({ name: statusName });
    if (!status)
      throw new NotFoundException(`Статус "${statusName}" не найден`);

    organizer.verificationStatus = status;
    await this.organizerRepo.save(organizer);
    return { message: `Организатор ${statusName.toLowerCase()}` };
  }

  // 6. Список жалоб
  async getComplaints() {
    return this.complaintRepo.find({
      relations: { user: { profile: true }, review: true, event: true },
      order: { createdAt: 'DESC' },
    });
  }

  // 7. Обработка жалобы
   async processComplaint(complaintId: number, dto: ProcessComplaintDto) {
    const complaint = await this.complaintRepo.findOne({
      where: { id: complaintId },
      relations: { review: true }, // Подтягиваем отзыв
    });
    if (!complaint) throw new NotFoundException('Жалоба не найдена');

    complaint.status = dto.status;
    await this.complaintRepo.save(complaint);

    // Если жалоба одобрена и это жалоба на отзыв — удаляем отзыв
    if (dto.status === 'resolved' && complaint.review) {
      await this.reviewRepo.remove(complaint.review);
      return { message: 'Жалоба обработана (статус: resolved). Отзыв удален.' };
    }

    return { message: `Жалоба обработана (статус: ${dto.status})` };
  }
}
