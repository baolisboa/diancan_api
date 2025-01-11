import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 规格
 */
@Entity('goods_spec')
export class GoodsSpecEntity extends BaseEntity {
  @Index()
  @Column({ comment: '商品ID' })
  goodsId: number;

  @Column({ comment: '名称' })
  name: string;

  @Column({
    comment: '价格',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  price: number;

  @Column({ comment: '库存', default: 0 })
  stock: number;

  @Column({ comment: '排序', default: 0, nullable: true })
  sortNum: number;

  @Column({ comment: '图片', type: 'json', nullable: true })
  images: string[];
}
