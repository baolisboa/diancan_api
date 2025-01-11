import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MarketCouponInfoEntity } from '../../entity/coupon/info';
import { MarketCouponUserService } from './user';
import { OrderInfoEntity } from '../../../order/entity/info';
import * as moment from 'moment';

/**
 * 优惠券信息
 */
@Provide()
export class MarketCouponInfoService extends BaseService {
  @InjectEntityModel(MarketCouponInfoEntity)
  marketCouponInfoEntity: Repository<MarketCouponInfoEntity>;

  @Inject()
  marketCouponUserService: MarketCouponUserService;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.marketCouponInfoEntity);
  }

  /**
   * 检查优惠券状态
   * @param couponId
   */
  async check(couponId: number) {
    const couponInfo: MarketCouponInfoEntity = await super.info(couponId);
    if (!couponInfo) {
      throw new CoolCommException('优惠券不存在');
    }
    // 判断数量
    if (couponInfo.receivedNum >= couponInfo.num) {
      throw new CoolCommException('优惠券已领完');
    }
    // 判断时间
    if (
      moment().isBefore(couponInfo.startTime) ||
      moment().isAfter(couponInfo.endTime)
    ) {
      throw new CoolCommException('优惠券未开始或已结束');
    }
    // 判断状态
    if (couponInfo.status !== 1) {
      throw new CoolCommException('优惠券未启用');
    }
    return couponInfo;
  }

  /**
   * 领取优惠券
   * @param couponId
   * @param userId
   */
  async receive(couponId: number, userId: number) {
    // 检查优惠券
    await this.check(couponId);
    // 检查用户是否已领取
    if (await this.marketCouponUserService.checkExist(couponId, userId)) {
      throw new CoolCommException('已领取过该优惠券');
    }
    // 保存
    await this.marketCouponUserService.save(couponId, userId);
    // 增加领取数量
    await this.marketCouponInfoEntity.increment(
      { id: couponId },
      'receivedNum',
      1
    );
  }

  /**
   * 检查优惠券是否满足条件，满足的话使用并设置和返回订单优惠金额
   * @param couponId
   * @param userId
   * @param order
   */
  async checkAndUse(couponId: number, userId: number, order: OrderInfoEntity) {
    // 判断优惠券
    const couponInfo = await this.check(couponId);
    // 判断用户
    await this.marketCouponUserService.check(couponId, userId);
    // 判断条件
    if (couponInfo.type == 0) {
      // 满减
      if (order.price < couponInfo.condition.fullAmount) {
        throw new CoolCommException('未满足优惠券使用条件');
      }
      // 设置订单的优惠金额
      order.discountPrice = couponInfo.amount;
      // 设置优惠来源
      order.discountSource = {
        type: 0,
        objectId: couponId,
        info: couponInfo,
      };
      // 设置商品的优惠金额
      if (order.price > 0) {
        order.goodsList.forEach(goods => {
          // 优惠金额 = 商品价格 / 订单总价 * 优惠金额 保留两位小数
          goods.discountPrice = Number(
            ((goods.price / order.price) * couponInfo.amount).toFixed(2)
          );
        });
      }
      // 使用优惠券
      await this.marketCouponUserService.use(couponId, userId);
      return couponInfo.amount;
    }
    return 0;
  }
}
