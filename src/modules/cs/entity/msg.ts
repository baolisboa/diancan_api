import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 客服消息
 */
@Entity('cs_msg')
export class CsMsgEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Index()
  @Column({ comment: '会话ID' })
  sessionId: number;

  @Column({ comment: '消息内容', type: 'json' })
  content: {
    type:
      | 'text'
      | 'image'
      | 'voice'
      | 'video'
      | 'file'
      | 'link'
      | 'location'
      | 'emoji';
    data: string;
  };

  @Column({ comment: '类型 0-反馈 1-回复', default: 0 })
  type: number;

  @Column({ comment: '状态 0-未读 1-已读', default: 0 })
  status: number;
}
