import { CoolController, BaseController } from '@cool-midway/core';
import { CsSessionEntity } from '../../entity/session';
import { UserInfoEntity } from '../../../user/entity/info';

/**
 * 客服会话
 */
@CoolController({
  api: ['page'],
  entity: CsSessionEntity,
  pageQueryOp: {
    select: ['a.*', 'b.nickName', 'b.avatarUrl'],
    join: [
      {
        entity: UserInfoEntity,
        alias: 'b',
        condition: 'a.userId = b.id',
      },
    ],
  },
})
export class Controller extends BaseController {}
