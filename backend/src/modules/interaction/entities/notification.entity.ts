import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { NotificationType } from '../../dictionaries/entities/notification-type.entity.js';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => NotificationType)
  @JoinColumn()
  type: NotificationType;
}