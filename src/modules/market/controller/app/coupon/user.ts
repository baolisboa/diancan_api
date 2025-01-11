import { CoolController, BaseController } from '@cool-midway/core';
import { MarketCouponUserEntity } from '../../../entity/coupon/user';
import { MarketCouponUserService } from '../../../service/coupon/user';
import { MarketCouponInfoService } from '../../../service/coupon/info';
import { Inject, Post, Body } from '@midwayjs/core';
import { MarketCouponInfoEntity } from '../../../entity/coupon/info';

/**
 * 优惠券用户
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MarketCouponUserEntity,
  service: MarketCouponUserService,
  pageQueryOp: {
    keyWordLikeFields: ['a.title'],
    fieldEq: ['a.status'],
    select: ['b.*', 'a.status as useStatus'],
    where: ctx => {
      const userId = ctx.user.id;
      return [
        // 只返回当前用户的优惠券
        ['a.userId =:userId', { userId }],
      ];
    },
    join: [
      {
        entity: MarketCouponInfoEntity,
        alias: 'b',
        condition: 'a.couponId = b.id',
      },
    ],
  },
})
export class AppMarketCouponUserController extends BaseController {
  @Inject()
  marketCouponInfoService: MarketCouponInfoService;

  @Inject()
  marketCouponUserService: MarketCouponUserService;

  @Inject()
  ctx;

  @Post('/receive', { summary: '领取优惠券' })
  async receive(@Body('couponId') couponId: number) {
    return this.ok(
      await this.marketCouponInfoService.receive(couponId, this.ctx.user.id)
    );
  }

  @Post('/my', { summary: '我的优惠券' })
  async my() {
    return this.ok(await this.marketCouponUserService.my(this.ctx.user.id));
  }
}
