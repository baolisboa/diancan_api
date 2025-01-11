import { BaseController, CoolController, CoolUrlTag, TagTypes } from '@cool-midway/core';
import { ShopInfoEntity } from '../../entity/info';

/**
 * 店铺信息
 */
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['list']
})
@CoolController({
  api: ['list'],
  entity: ShopInfoEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.name', 'a.contact'],
    select: ['a.*'],
  },
})
export class AppShopInfoController extends BaseController {}
