import {
  CoolController,
  BaseController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { InfoBannerEntity } from '../../entity/banner';

/**
 * 轮播图
 */
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['list'],
})
@CoolController({
  api: ['list'],
  entity: InfoBannerEntity,
  listQueryOp: {
    keyWordLikeFields: ['a.title'],
    fieldEq: ['a.status', 'a.type'],
    where: () => {
      return [['a.status =:status', { status: 1 }]];
    },
  },
})
export class AppInfoBannerController extends BaseController {}
