import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';
import { CsMsgEntity } from './msg';

/**
 * 客服会话
 */
@Entity('cs_session')
export class CsSessionEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '最后一条消息', nullable: true, type: 'json' })
  lastMsg: CsMsgEntity;

  @Column({ comment: '客服未读消息数', default: 0 })
  adminUnreadCount: number;
}
