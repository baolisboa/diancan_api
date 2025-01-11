import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { UserVipEntity } from '../../entity/vip';
import { UserVipService } from '../../service/vip';

/**
 * 会员
 */
@CoolUrlTag()
@CoolController({
  entity: UserVipEntity,
  api: ['list'],
  service: UserVipService,
  listQueryOp: {
    where() {
      return [['status = 1', true]];
    },
  },
})
export class ApppUserVipController extends BaseController {}
