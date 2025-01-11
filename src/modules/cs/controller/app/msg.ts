import { CoolController, BaseController } from '@cool-midway/core';
import { CsMsgEntity } from '../../entity/msg';
import { CsSessionEntity } from '../../entity/session';
import { BaseSysUserEntity } from '../../../base/entity/sys/user';
import { UserInfoEntity } from '../../../user/entity/info';
import { Body, Get, Inject, Post } from '@midwayjs/core';
import { CsMsgService } from '../../service/msg';

/**
 * 消息
 */
@CoolController({
  api: ['page'],
  entity: CsMsgEntity,
  pageQueryOp: {
    select: [
      'a.*',
      'b.nickName',
      'b.avatarUrl',
      'c.name as adminUserName',
      'c.headImg as adminUserHeadImg',
    ],
    join: [
      {
        entity: UserInfoEntity,
        alias: 'b',
        condition: 'a.userId = b.id and a.type = 0',
      },
      {
        entity: BaseSysUserEntity,
        alias: 'c',
        condition: 'a.userId = c.id and a.type = 1',
      },
      {
        entity: CsSessionEntity,
        alias: 'd',
        condition: 'a.sessionId = d.id',
      },
    ],
    where: ctx => {
      return [['d.userId = :userId', { userId: ctx.user?.id }]];
    },
  },
})
export class AppCsMsgController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  csMsgService: CsMsgService;

  @Get('/unreadCount', { summary: '未读消息数' })
  async unreadCount() {
    return this.ok(await this.csMsgService.unreadCount(this.ctx.user?.id, 1));
  }

  @Post('/read', { summary: '标记已读' })
  async read(@Body('msgIds') msgIds: number[]) {
    this.csMsgService.read(msgIds);
    return this.ok();
  }
}
