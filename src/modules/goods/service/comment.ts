import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { GoodsCommentEntity } from '../entity/comment';
import { OrderInfoService } from '../../order/service/info';
import { OrderGoodsEntity } from '../../order/entity/goods';

/**
 * 商品评论
 */
@Provide()
export class GoodsCommentService extends BaseService {
  @InjectEntityModel(GoodsCommentEntity)
  goodsCommentEntity: Repository<GoodsCommentEntity>;

  @InjectEntityModel(OrderGoodsEntity)
  orderGoodsEntity: Repository<OrderGoodsEntity>;

  @Inject()
  orderInfoService: OrderInfoService;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.goodsCommentEntity);
  }

  /**
   * 提交评论
   * @param userId
   * @param orderId
   * @param comment
   */
  async submit(userId: number, orderId: number, comment: GoodsCommentEntity) {
    const order = await this.orderInfoService.info(orderId);
    if (order && order.userId != userId) {
      throw new CoolCommException('无权限');
    }
    if (![3, 4].includes(order.status)) {
      throw new CoolCommException('不是可评价的订单状态');
    }
    const goods = await this.orderGoodsEntity.findOneBy({
      goodsId: Equal(comment.goodsId),
      orderId: Equal(orderId),
    });
    if (!goods) {
      throw new CoolCommException('商品不存在');
    }
    if (goods.isComment) {
      throw new CoolCommException('已评价过，不能重复评价');
    }
    // 更新订单商品状态
    await this.orderGoodsEntity.update(goods.id, { isComment: 1 });
    // 订单状态改为交易完成
    if (order.status == 3) {
      await this.orderInfoService.changeStatus(orderId, 4);
    }
    comment.userId = userId;
    await this.add(comment);
  }
}
