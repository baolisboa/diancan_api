import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { CsSessionEntity } from '../entity/session';

/**
 * 客服会话
 */
@Provide()
export class CsSessionService extends BaseService {
  @InjectEntityModel(CsSessionEntity)
  csSessionEntity: Repository<CsSessionEntity>;

  /**
   * 会话详情
   * @param userId
   */
  async detail(userId: number) {
    return await this.csSessionEntity.findOneBy({ userId });
  }

  /**
   * 创建会话
   * @param userId
   * @returns
   */
  async create(userId: number) {
    const check = await this.detail(userId);
    if (check) {
      return check;
    }
    const session = new CsSessionEntity();
    session.userId = userId;
    await this.csSessionEntity.insert(session);
    return session;
  }
}
