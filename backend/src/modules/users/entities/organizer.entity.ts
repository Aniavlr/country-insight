import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { User } from './user.entity.js';
import { OrganizerType } from '../../dictionaries/entities/organizer-type.entity.js';
import { VerificationStatus } from '../../dictionaries/entities/verification-status.entity.js';
import { Category } from '../../dictionaries/entities/category.entity.js';
import { City } from '../../dictionaries/entities/city.entity.js';

@Entity('organizers')
export class Organizer extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  contacts: string;

  @Column({ nullable: true })
  socials: string;

  // Связи:
  @OneToOne(() => User, (user) => user.organizer, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => City)
  @JoinColumn()
  city: City;

  @ManyToOne(() => OrganizerType)
  @JoinColumn()
  type: OrganizerType;

  @ManyToOne(() => VerificationStatus)
  @JoinColumn()
  verificationStatus: VerificationStatus;

  @ManyToMany(() => Category)
  @JoinTable({ name: 'organizer_categories' })
  categories: Category[];
}
