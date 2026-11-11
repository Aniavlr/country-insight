import { Entity, Column, OneToOne, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import type { User } from './user.entity.js';
import { City } from '../../dictionaries/entities/city.entity.js';

@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  emailNotifications: boolean;

   @OneToOne('User', (user: User) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Relation<User>;

  @ManyToOne(() => City, { nullable: true })
  @JoinColumn()
  city: City;
}
