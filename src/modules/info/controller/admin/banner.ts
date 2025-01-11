import { CoolController, BaseController } from '@cool-midway/core';
import { InfoBannerEntity } from '../../entity/banner';

/**
 * 轮播图
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: InfoBannerEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.title'],
    fieldEq: ['a.status', 'a.type'],
  },
})
export class AdminInfoBannerController extends BaseController {}
