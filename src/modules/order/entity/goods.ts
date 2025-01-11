import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';
import { GoodsInfoEntity } from '../../goods/entity/info';
import { GoodsSpecEntity } from '../../goods/entity/spec';

/**
 * 订单商品
 */
@Entity('order_goods')
export class OrderGoodsEntity extends BaseEntity {
  @Index()
  @Column({ comment: '订单ID' })
  orderId: number;

  @Index()
  @Column({ comment: '商品ID' })
  goodsId: number;

  @Index()
  @Column({ comment: '门店ID' })
  shopId: number;

  @Column({
    comment: '价格',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  price: number;

  @Column({
    comment: '优惠金额',
    type: 'decimal',
    scale: 2,
    precision: 12,
    default: 0,
  })
  discountPrice: number;

  @Column({ comment: '数量' })
  count: number;

  @Column({ comment: '其他信息', nullable: true })
  remark: string;

  // 随着时间的推移，商品信息会变，这边必须记录购买时的商品信息
  @Column({ comment: '商品信息', type: 'json' })
  goodsInfo: GoodsInfoEntity;

  @Column({ comment: '规格', nullable: true })
  spec: string;

  @Column({ comment: '是否评价 0-否 1-是', default: 0 })
  isComment: number;
}
