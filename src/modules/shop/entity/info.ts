import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 店铺信息
 */
@Entity('shop_info')
export class ShopInfoEntity extends BaseEntity {
  @Column({ comment: '店铺名称' })
  name: string;

  @Column({ comment: '联系人' })
  contact: string;

  @Column({ comment: '手机号码' })
  phone: string;

  @Column({ comment: '开始营业时间' })
  startBusinessHours: string;

  @Column({ comment: '结束营业时间' })
  endBusinessHours: string;

  @Column({ comment: '状态 0-禁用 1-启用', default: 0 })
  status: number;

  @Column({ comment: '省' })
  province: string;

  @Column({ comment: '市' })
  city: string;

  @Column({ comment: '区' })
  district: string;

  @Column({ comment: '店铺地址' })
  address: string;

  @Column({
    comment: '纬度',
    type: 'float',
    precision: 12,
    scale: 8,
    nullable: true,
  })
  lat: number;

  @Column({
    comment: '经度',
    type: 'float',
    precision: 12,
    scale: 8,
    nullable: true,
  })
  lng: number;
}
