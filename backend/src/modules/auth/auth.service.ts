import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/entities/user.entity.js';
import { UserProfile } from '../users/entities/user-profile.entity.js';
import { Organizer } from '../users/entities/organizer.entity.js';
import { VerificationStatus } from '../dictionaries/entities/verification-status.entity.js';
import { OrganizerType } from '../dictionaries/entities/organizer-type.entity.js';
import { City } from '../dictionaries/entities/city.entity.js';

import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { OrganizerRegisterDto } from './dto/organizer-register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserProfile) private profileRepo: Repository<UserProfile>,
    @InjectRepository(Organizer) private organizerRepo: Repository<Organizer>,
    @InjectRepository(VerificationStatus)
    private verifStatusRepo: Repository<VerificationStatus>,
    @InjectRepository(OrganizerType)
    private orgTypeRepo: Repository<OrganizerType>,
    @InjectRepository(City) private cityRepo: Repository<City>,
    private jwtService: JwtService,
  ) {}

  // 1. Регистрация обычного пользователя
  async registerUser(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email уже занят');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      role: UserRole.USER,
    });
    await this.userRepo.save(user);

    const profile = this.profileRepo.create({
      user: user,
      firstName: dto.firstName,
    });
    await this.profileRepo.save(profile);

    return this.generateToken(user);
  }

  // 2. Регистрация организатора
  async registerOrganizer(dto: OrganizerRegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email уже занят');

    const city = await this.cityRepo.findOne({ where: { id: dto.cityId } });
    const type = await this.orgTypeRepo.findOne({
      where: { id: dto.organizerTypeId },
    });
    const pendingStatus = await this.verifStatusRepo.findOne({
      where: { name: 'На проверке' },
    });

    if (!city) throw new NotFoundException('Город не найден');
    if (!type) throw new NotFoundException('Тип организатора не найден');
    if (!pendingStatus) {
      throw new BadRequestException(
        'Статус "На проверке" не найден в справочнике',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepo.save(
      this.userRepo.create({
        email: dto.email,
        passwordHash,
        role: UserRole.ORGANIZER,
      }),
    );

    await this.organizerRepo.save(
      this.organizerRepo.create({
        user,
        name: dto.organizerName,
        description: dto.description,
        city,
        type,
        verificationStatus: pendingStatus,
      }),
    );

    return this.generateToken(user);
  }

  // 3. Вход (Логин)
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Неверный email или пароль');
    if (user.isBlocked) throw new UnauthorizedException('Аккаунт заблокирован');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Неверный email или пароль');

    return this.generateToken(user);
  }

  // Вспомогательный метод: создание JWT-токена
  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
