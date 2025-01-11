import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { UserVipEntity } from '../../entity/vip';
import { UserVipService } from '../../service/vip';

/**
 * 会员
 */
@CoolUrlTag()
@CoolController({
  entity: UserVipEntity,
  api: ['page', 'list', 'add', 'delete', 'info', 'update'],
  service: UserVipService,
  pageQueryOp: {
    keyWordLikeFields: ['name'],
  },
})
export class AdminUserVipController extends BaseController {}
