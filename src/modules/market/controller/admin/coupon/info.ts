import { CoolController, BaseController } from '@cool-midway/core';
import { MarketCouponInfoEntity } from '../../../entity/coupon/info';
import { MarketCouponInfoService } from '../../../service/coupon/info';

/**
 * 优惠券信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MarketCouponInfoEntity,
  service: MarketCouponInfoService,
  pageQueryOp: {
    keyWordLikeFields: ['a.title'],
    fieldEq: ['a.status'],
  },
})
export class AdminMarketCouponInfoController extends BaseController {}
