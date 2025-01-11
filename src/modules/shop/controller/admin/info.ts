import { CoolController, BaseController } from '@cool-midway/core';
import { ShopInfoEntity } from '../../entity/info';

/**
 * 店铺信息
 */
@CoolController({
  api: ['page', 'list', 'info', 'add', 'update', 'delete'],
  entity: ShopInfoEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.name', 'a.contact'],
    select: ['a.*'],
  },
})
export class AdminShopInfoController extends BaseController {}
