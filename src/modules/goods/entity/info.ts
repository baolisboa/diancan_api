import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商品信息
 */
@Entity('goods_info')
export class GoodsInfoEntity extends BaseEntity {
  @Index()
  @Column({ comment: '类型ID' })
  typeId: number;

  @Index()
  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '描述', nullable: true })
  desc: string;

  @Column({ comment: '标签', nullable: true, type: 'json' })
  tags: string[];

  @Column({ comment: '封面图' })
  mainPic: string;

  @Column({
    comment: '价格',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  price: number;

  @Column({ comment: '已售', default: 0 })
  sold: number;

  @Index()
  @Column({ comment: '状态 0-下架 1-上架', default: 0 })
  status: number;

  @Column({ comment: '排序', default: 0, nullable: true })
  sortNum: number;

  @Column({ comment: '规格', nullable: true, type: 'json' })
  specs: any[];
}
