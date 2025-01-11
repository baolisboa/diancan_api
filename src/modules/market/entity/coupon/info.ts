import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 优惠券信息
 */
@Entity('market_coupon_info')
export class MarketCouponInfoEntity extends BaseEntity {
  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '描述' })
  description: string;

  @Column({ comment: '类型 0-满减', default: 0 })
  type: number;

  @Column({ comment: '金额', type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ comment: '数量' })
  num: number;

  @Column({ comment: '已领取' })
  receivedNum: number;

  @Column({ comment: '开始时间' })
  startTime: Date;

  @Column({ comment: '结束时间' })
  endTime: Date;

  @Column({ comment: '状态 0-禁用 1-启用', default: 0 })
  status: number;

  @Column({ comment: '条件', type: 'json' })
  condition: {
    // 满多少金额
    fullAmount: number;
  };
}
