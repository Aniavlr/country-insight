import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Order } from './order.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('refund_requests')
export class RefundRequest extends BaseEntity {
  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column()
  status: string; // 'pending', 'approved', 'rejected'

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}