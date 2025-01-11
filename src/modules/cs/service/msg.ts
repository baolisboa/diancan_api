import { App, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { CsMsgEntity } from '../entity/msg';
import { CsSessionEntity } from '../entity/session';
import { CsConnService } from './conn';
import { Application as SocketApplication } from '@midwayjs/socketio';
import * as _ from 'lodash';
import { UserInfoEntity } from '../../user/entity/info';
import { BaseSysUserEntity } from '../../base/entity/sys/user';

/**
 * 消息
 */
@Provide()
export class CsMsgService extends BaseService {
  @InjectEntityModel(CsMsgEntity)
  csMsgEntity: Repository<CsMsgEntity>;

  @InjectEntityModel(CsSessionEntity)
  csSessionEntity: Repository<CsSessionEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  @Inject()
  csConnService: CsConnService;

  @App('socketIO')
  socketApp: SocketApplication;

  @Inject()
  ctx;

  /**
   * 消息标记为已读
   * @param msgIds
   */
  async read(msgIds: number[]) {
    await this.csMsgEntity.update({ id: In(msgIds) }, { status: 1 });
  }

  /**
   * 未读消息数
   * @param userId
   * @param type
   */
  async unreadCount(userId: number, type: number) {
    if (userId) {
      return this.csMsgEntity.countBy({ userId, type, status: 0 });
    }
    return this.csMsgEntity.countBy({ type, status: 0 });
  }

  /**
   * 更新客户未读消息数
   * @param sessionId
   */
  async updateAdminUnreadCount(sessionId: number) {
    const count = await this.csMsgEntity.countBy({
      sessionId,
      type: 0,
      status: 0,
    });
    await this.csSessionEntity.update(sessionId, { adminUnreadCount: count });
  }

  /**
   * 分页查询
   * @param query
   * @param option
   * @param connectionName
   */
  async page(query: any, option: any, connectionName?: any) {
    const { sessionId } = query;
    const result = await super.page(query, option, connectionName);
    // 消息置为已读
    const type = this.ctx.user?.id ? 1 : 0;
    await this.csMsgEntity.update({ sessionId, type }, { status: 1 });
    // 更新未读消息数
    await this.updateAdminUnreadCount(sessionId);

    return result;
  }

  /**
   * 消息发送
   * @param msg
   */
  async send(msg: any, isAdmin: boolean) {
    let session = await this.csSessionEntity.findOneBy({ id: msg.sessionId });
    if (isAdmin) {
      msg.type = 1;
    } else {
      msg.type = 0;
      if (!session) {
        session = new CsSessionEntity();
        session.userId = msg.userId;
        await this.csSessionEntity.insert(session);
      }
    }
    await this.csMsgEntity.insert(msg);
    // 更新未读消息数
    await this.updateAdminUnreadCount(msg.sessionId);
    // 更新最后一条消息
    await this.csSessionEntity.update(session.id, { lastMsg: msg });

    // 完善消息内容
    if (msg.type == 0) {
      const user = await this.userInfoEntity.findOneBy({ id: msg.userId });
      msg.user = {
        userId: user.id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
      };
    }
    if (msg.type == 1) {
      const user = await this.baseSysUserEntity.findOneBy({ id: msg.userId });
      msg.user = {
        userId: user.id,
        nickName: user.name,
        avatarUrl: user.headImg,
      };
    }
    // 发送给客户端
    if (isAdmin) {
      // 获得连接ID
      const connId = await this.csConnService.getConnId(false, msg.sessionId);
      // 发送消息
      this.socketApp.of('/cs').to(connId).emit('msg', msg);
    } else {
      // 广播给所有的后端客服
      this.socketApp.of('/cs').emit('msg', msg);
    }
  }
}
