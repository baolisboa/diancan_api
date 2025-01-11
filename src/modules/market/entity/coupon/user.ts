import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 优惠券用户
 */
@Entity('market_coupon_user')
export class MarketCouponUserEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Index()
  @Column({ comment: '优惠券ID' })
  couponId: number;

  @Column({ comment: '状态 0-未使用 1-已使用', default: 0 })
  status: number;

  @Column({ comment: '使用时间', type: 'datetime', nullable: true })
  useTime: Date;
}
