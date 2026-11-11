import { Entity, Column, OneToOne, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import type { UserProfile } from './user-profile.entity.js';
import type { Organizer } from './organizer.entity.js';

export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
  ADMIN = 'admin',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string; // хеш пароля

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: false })
  isBlocked: boolean;

  // Связи:
  @OneToOne('UserProfile', (profile: UserProfile) => profile.user)
  profile: Relation<UserProfile>;

 @OneToOne('Organizer', (organizer: Organizer) => organizer.user) // <-- Заменили () => Organizer на строку 'Organizer'
  organizer: Relation<Organizer>;
}
