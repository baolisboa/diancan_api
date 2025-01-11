import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 轮播图
 */
@Entity('info_banner')
export class InfoBannerEntity extends BaseEntity {
  @Column({ comment: '标题', nullable: true })
  title: string;

  @Column({ comment: '描述', nullable: true })
  description: string;

  @Column({ comment: '跳转路径', nullable: true })
  path: string;

  @Column({ comment: '图片' })
  pic: string;

  @Column({ comment: '排序', default: 0, nullable: true })
  sortNum: number;

  @Column({ comment: '状态 1:启用 2:禁用', default: 1 })
  status: number;

  @Column({ comment: '类型 1:首页 2:点餐页', default: 1 })
  type: number;
}
