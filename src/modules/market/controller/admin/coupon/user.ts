import { CoolController, BaseController } from '@cool-midway/core';
import { MarketCouponUserEntity } from '../../../entity/coupon/user';
import { MarketCouponUserService } from '../../../service/coupon/user';
import { UserInfoEntity } from '../../../../user/entity/info';

/**
 * 优惠券用户
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MarketCouponUserEntity,
  service: MarketCouponUserService,
  pageQueryOp: {
    keyWordLikeFields: ['a.title', 'b.nickName'],
    fieldEq: ['a.status', 'a.couponId', 'a.userId'],
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
export class AdminMarketCouponUserController extends BaseController {}
