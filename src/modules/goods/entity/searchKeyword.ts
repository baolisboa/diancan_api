import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 搜索关键词
 */
@Entity('goods_search_keyword')
export class GoodsSearchKeywordEntity extends BaseEntity {
  @Column({ comment: '名称' })
  name: string;

  @Column({ comment: '排序', default: 0, nullable: true })
  sortNum: number;
}
