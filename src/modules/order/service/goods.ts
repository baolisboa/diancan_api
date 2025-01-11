import { BaseService } from '@cool-midway/core';
import { Init, Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import BigNumber from 'bignumber.js';
import { Equal, In, Repository } from 'typeorm';
import { GoodsSpecService } from '../../goods/service/spec';
import { OrderGoodsEntity } from '../entity/goods';

/**
 * 订单商品
 */
@Provide()
export class OrderGoodsService extends BaseService {
  @InjectEntityModel(OrderGoodsEntity)
  orderGoodsEntity: Repository<OrderGoodsEntity>;

  @Inject()
  goodsSpecService: GoodsSpecService;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.orderGoodsEntity);
  }

  /**
   * 保存
   * @param orderId
   * @param goodsList
   */
  async save(orderId: number, goodsList: OrderGoodsEntity[]) {
    await this.orderGoodsEntity.save(
      goodsList.map(item => {
        item.orderId = orderId;
        return item;
      })
    );
  }

  /**
   * 获得总价
   * @param goodsList
   */
  async getTotalPrice(goodsList: OrderGoodsEntity[]) {
    let totalPrice = new BigNumber(0);
    for (const goods of goodsList) {
      totalPrice = totalPrice.plus(goods.price * goods.count);
    }
    return totalPrice.toNumber();
  }

  /**
   * 通过订单ID获取商品
   * @param orderId
   */
  async getByOrderId(orderId: number) {
    return await this.orderGoodsEntity.findBy({ orderId: Equal(orderId) });
  }

  /**
   * 通过订单ID获取商品
   * @param orderId
   */
  async getByOrderIds(orderIds: number[]) {
    return await this.orderGoodsEntity.findBy({ orderId: In(orderIds) });
  }

  // 更新库存
  async updateStock(
    goodsList: OrderGoodsEntity[],
    type: 'add' | 'sub' = 'sub'
  ) {
    for (const goods of goodsList) {
      await this.goodsSpecService.updateStock(
        goods.spec['id'],
        type == 'add' ? goods.count : -goods.count
      );
    }
  }
}
