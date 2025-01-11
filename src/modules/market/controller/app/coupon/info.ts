import {
  CoolController,
  BaseController,
  QueryOp,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { MarketCouponInfoEntity } from '../../../entity/coupon/info';
import { MarketCouponInfoService } from '../../../service/coupon/info';
import * as moment from 'moment';
import { MarketCouponUserEntity } from '../../../entity/coupon/user';

/**
 * 优惠券信息
 */
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page'],
})
@CoolController({
  api: ['page'],
  entity: MarketCouponInfoEntity,
  service: MarketCouponInfoService,
  // 获得ctx对象
  pageQueryOp: ctx => {
    return new Promise<QueryOp>(res => {
      res({
        keyWordLikeFields: ['a.title'],
        fieldEq: ['a.status'],
        select: ['a.*', 'b.userId'],
        where: () => {
          return [
            // 只返回启用的优惠券
            ['a.status =:status', { status: 1 }],
            // 只返回已开始和未结束的优惠券
            ['a.startTime <=:startTime', { startTime: moment().toDate() }],
            ['a.endTime >=:endTime', { endTime: moment().toDate() }],
          ];
        },
        join: [
          {
            entity: MarketCouponUserEntity,
            alias: 'b',
            condition: 'a.id = b.couponId and b.userId =' + (ctx.user?.id || 0),
          },
        ],
      });
    });
  },
})
export class AppMarketCouponInfoController extends BaseController {}
