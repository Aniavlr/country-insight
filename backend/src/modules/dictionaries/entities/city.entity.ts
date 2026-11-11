import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('cities')
export class City extends BaseEntity {
  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  lat: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  lon: number;
}
