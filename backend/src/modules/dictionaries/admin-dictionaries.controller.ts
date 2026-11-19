import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { City } from './entities/city.entity.js';
import { Category } from './entities/category.entity.js';
import { Format } from './entities/format.entity.js';
import { AgeLimit } from './entities/age-limit.entity.js';
import { Badge } from './entities/badge.entity.js';
import { DictionaryItemDto } from './dto/dictionary-item.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';

@ApiTags('Админ: Справочники')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/dictionaries')
export class AdminDictionariesController {
  constructor(
    @InjectRepository(City) private cityRepo: Repository<City>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Format) private formatRepo: Repository<Format>,
    @InjectRepository(AgeLimit) private ageLimitRepo: Repository<AgeLimit>,
    @InjectRepository(Badge) private badgeRepo: Repository<Badge>,
  ) {}

  private async safeDelete(repo: Repository<any>, id: number) {
    try {
      const res = await repo.delete(id);
      if (res.affected === 0) throw new NotFoundException('Запись не найдена');
      return { message: 'Запись успешно удалена' };
    } catch (err: any) {
      if (err.code === '23503') {
        throw new BadRequestException(
          'Нельзя удалить запись, так как она уже используется в других таблицах',
        );
      }
      throw err;
    }
  }

  // ================= ГОРОДА =================
  @Post('cities')
  createCity(@Body() dto: DictionaryItemDto) {
    return this.cityRepo.save(this.cityRepo.create(dto));
  }
  @Put('cities/:id')
  updateCity(@Param('id') id: string, @Body() dto: DictionaryItemDto) {
    return this.cityRepo.update(+id, dto);
  }
  @Delete('cities/:id')
  deleteCity(@Param('id') id: string) {
    return this.safeDelete(this.cityRepo, +id);
  }

  // ================= КАТЕГОРИИ =================
  @Post('categories')
  createCategory(@Body() dto: DictionaryItemDto) {
    return this.categoryRepo.save(this.categoryRepo.create(dto));
  }
  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: DictionaryItemDto) {
    return this.categoryRepo.update(+id, dto);
  }
  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.safeDelete(this.categoryRepo, +id);
  }

  // ================= ФОРМАТЫ =================
  @Post('formats')
  createFormat(@Body() dto: DictionaryItemDto) {
    return this.formatRepo.save(this.formatRepo.create(dto));
  }
  @Put('formats/:id')
  updateFormat(@Param('id') id: string, @Body() dto: DictionaryItemDto) {
    return this.formatRepo.update(+id, dto);
  }
  @Delete('formats/:id')
  deleteFormat(@Param('id') id: string) {
    return this.safeDelete(this.formatRepo, +id);
  }

  // ================= ВОЗРАСТНЫЕ ОГРАНИЧЕНИЯ =================
  @Post('age-limits')
  createAgeLimit(@Body() dto: DictionaryItemDto) {
    return this.ageLimitRepo.save(
      this.ageLimitRepo.create({ value: dto.name }),
    );
  }
  @Put('age-limits/:id')
  updateAgeLimit(@Param('id') id: string, @Body() dto: DictionaryItemDto) {
    return this.ageLimitRepo.update(+id, { value: dto.name });
  }
  @Delete('age-limits/:id')
  deleteAgeLimit(@Param('id') id: string) {
    return this.safeDelete(this.ageLimitRepo, +id);
  }

  // ================= БЕЙДЖИ =================
  @Post('badges')
  createBadge(@Body() dto: DictionaryItemDto) {
    return this.badgeRepo.save(
      this.badgeRepo.create({
        name: dto.name,
        description: dto.description,
        condition: dto.condition,
      }),
    );
  }
  @Put('badges/:id')
  updateBadge(@Param('id') id: string, @Body() dto: DictionaryItemDto) {
    return this.badgeRepo.update(+id, {
      name: dto.name,
      description: dto.description,
      condition: dto.condition,
    });
  }
  @Delete('badges/:id')
  deleteBadge(@Param('id') id: string) {
    return this.safeDelete(this.badgeRepo, +id);
  }
}
