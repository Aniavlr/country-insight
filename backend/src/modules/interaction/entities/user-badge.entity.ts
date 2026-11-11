import { Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Badge } from '../../dictionaries/entities/badge.entity.js';

@Entity('user_badges')
@Unique(['user', 'badge']) // Юзер не может получить один бейдж дважды
export class UserBadge extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Badge, { onDelete: 'CASCADE' })
  @JoinColumn()
  badge: Badge;
}