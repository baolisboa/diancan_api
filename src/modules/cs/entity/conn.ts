import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 客服连接
 */
@Entity('cs_conn')
export class CsConnEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '连接ID' })
  connId: string;

  @Column({ comment: '类型 0-客户 1-后台', default: 0 })
  type: number;
}
