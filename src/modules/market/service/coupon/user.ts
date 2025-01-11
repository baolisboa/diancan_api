import { Init, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { MarketCouponUserEntity } from '../../entity/coupon/user';

/**
 * 优惠券用户
 */
@Provide()
export class MarketCouponUserService extends BaseService {
  @InjectEntityModel(MarketCouponUserEntity)
  marketCouponUserEntity: Repository<MarketCouponUserEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.marketCouponUserEntity);
  }

  /**
   * 保存
   * @param idcouponId
   * @param userId
   */
  async save(couponId: number, userId: number) {
    const couponUser = new MarketCouponUserEntity();
    couponUser.userId = userId;
    couponUser.couponId = couponId;
    await this.marketCouponUserEntity.save(couponUser);
  }

  /**
   * 检查优惠券是否可用
   * @param couponId
   * @param userId
   */
  async check(couponId: number, userId: number) {
    const info = await this.marketCouponUserEntity.findOneBy({
      couponId: Equal(couponId),
      userId: Equal(userId),
      status: 0,
    });
    if (!info) {
      throw new CoolCommException('优惠券未领取或已使用');
    }
    return info;
  }

  /**
   * 检查优惠券是否存在
   * @param couponId
   * @param userId
   */
  async checkExist(couponId: number, userId: number) {
    const info = await this.marketCouponUserEntity.findOneBy({
      couponId: Equal(couponId),
      userId: Equal(userId),
    });
    return !!info;
  }

  /**
   * 使用优惠券
   * @param couponId
   * @param userId
   */
  async use(couponId: number, userId: number) {
    await this.marketCouponUserEntity.update(
      { couponId: Equal(couponId), userId: Equal(userId) },
      { status: 1, useTime: new Date() }
    );
  }

  /**
   * 我的优惠券
   */

  async my(userId: number) {
    return await this.marketCouponUserEntity.countBy({
      userId: Equal(userId),
      status: 0,
    });
  }
}
