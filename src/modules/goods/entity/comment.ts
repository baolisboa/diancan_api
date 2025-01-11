import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商品信息
 */
@Entity('goods_comment')
export class GoodsCommentEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Index()
  @Column({ comment: '商品ID' })
  goodsId: number;

  @Index()
  @Column({ comment: '订单ID' })
  orderId: number;

  @Column({ comment: '内容' })
  content: string;

  @Column({ comment: '星数', default: 5 })
  starCount: number;

  @Column({ comment: '图片', type: 'json', nullable: true })
  pics: string[];
}
