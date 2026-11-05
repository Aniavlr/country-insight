import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  icon: string; // Название иконки или путь к ней

  @Column({ unique: true })
  slug: string; // Например: 'Еда', 'Мастер-класс'
}
