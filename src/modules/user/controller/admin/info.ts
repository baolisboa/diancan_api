import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoEntity } from '../../entity/info';
import { UserVipEntity } from '../../entity/vip';

/**
 * 用户信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: UserInfoEntity,
  pageQueryOp: {
    fieldEq: ['status', 'gender', 'loginType'],
    keyWordLikeFields: ['nickName', 'phone'],
    select: ['a.*', 'b.name as vipName'],
    join: [
      {
        alias: 'b',
        entity: UserVipEntity,
        condition: 'a.level = b.level',
      },
    ],
  },
})
export class AdminUserInfoController extends BaseController {}
