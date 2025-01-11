import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 用户会员等级
 */
@Entity({ name: 'user_vip' })
export class UserVipEntity extends BaseEntity {
  @Column({ comment: '会员名称' })
  name: string;

  @Column({ comment: '会员等级', default: 1 })
  level: number;

  @Column({ comment: '会员权益' })
  desc: string;

  @Column({ comment: '积分门槛', default: 0 })
  score: number;

  @Column({ comment: '状态 0-禁用 1-启用', default: 0 })
  status: number;
}
