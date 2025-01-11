import { CoolController, BaseController } from '@cool-midway/core';
import { CsMsgEntity } from '../../entity/msg';
import { UserInfoEntity } from '../../../user/entity/info';
import { BaseSysUserEntity } from '../../../base/entity/sys/user';
import { CsMsgService } from '../../service/msg';
import { Body, Get, Inject, Post } from '@midwayjs/core';

/**
 * 消息
 */
@CoolController({
  api: ['page'],
  entity: CsMsgEntity,
  service: CsMsgService,
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
    ],
    where: ctx => {
      const { sessionId } = ctx.request.body;
      return [['a.sessionId = :sessionId', { sessionId }]];
    },
  },
})
export class AdminCsMsgController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  csMsgService: CsMsgService;

  @Get('/unreadCount', { summary: '未读消息数' })
  async unreadCount() {
    return this.ok(await this.csMsgService.unreadCount(null, 0));
  }

  @Post('/read', { summary: '标记已读' })
  async read(@Body('msgIds') msgIds: number[]) {
    this.csMsgService.read(msgIds);
    return this.ok();
  }
}
