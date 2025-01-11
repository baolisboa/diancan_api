import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { CsConnEntity } from '../entity/conn';
import { CsSessionEntity } from '../entity/session';

/**
 * 连接
 */
@Provide()
export class CsConnService extends BaseService {
  @InjectEntityModel(CsConnEntity)
  csConnEntity: Repository<CsConnEntity>;

  @InjectEntityModel(CsSessionEntity)
  csSessionEntity: Repository<CsSessionEntity>;

  /**
   * 绑定
   * @param isAdmin
   * @param userId
   * @param connId
   */
  async binding(isAdmin: boolean, userId: number, connId: string) {
    const info = await this.csConnEntity.findOneBy({
      userId,
      type: isAdmin ? 1 : 0,
    });
    if (info) {
      info.connId = connId;
      info.type = isAdmin ? 1 : 0;
      await this.csConnEntity.update(info.id, { connId: connId });
    } else {
      const entity = new CsConnEntity();
      entity.userId = userId;
      entity.connId = connId;
      entity.type = isAdmin ? 1 : 0;
      await this.csConnEntity.insert(entity);
    }
  }

  /**
   * 获得连接ID
   * @param isAdmin
   * @param sessionId
   */
  async getConnId(isAdmin: boolean, sessionId: number) {
    const session = await this.csSessionEntity.findOneBy({ id: sessionId });
    if (!session) return;
    const info = await this.csConnEntity.findOneBy({
      userId: session.userId,
      type: isAdmin ? 1 : 0,
    });
    return info ? info.connId : null;
  }
}
