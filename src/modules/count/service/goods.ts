import { Init, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { OrderGoodsEntity } from '../../order/entity/goods';

/**
 * 商品统计
 */
@Provide()
export class CountGoodsService extends BaseService {
  @InjectEntityModel(OrderGoodsEntity)
  orderGoodsEntity: Repository<OrderGoodsEntity>;

  /**
   * 销售排行
   * @param type 类型 count-数量 amount-金额
   * @param limit 条数
   */
  async rank(type: 'count' | 'amount', limit = 10) {
    const sql = `SELECT * FROM (
        SELECT
        a.goodsId,
        b.title,
        b.mainPic,
        ${type === 'count' ? 'SUM(a.count)' : 'SUM(a.price * a.count)'} AS total
    FROM
        order_goods a
        LEFT JOIN goods_info b ON a.goodsId = b.id 
    GROUP BY
        a.goodsId
    ORDER BY
        total DESC
    ) a LIMIT ${parseInt(limit.toString())}`;
    return this.nativeQuery(sql);
  }

  /**
   * 分类统计
   * @param type 类型 count-数量 amount-金额
   */
  async category(type: 'count' | 'amount') {
    const sql = `SELECT
        b.typeId,
        c.name AS typeName,
        ${type === 'count' ? 'SUM(a.count)' : 'SUM(a.price * a.count)'} AS total
    FROM
        order_goods a
        LEFT JOIN goods_info b ON a.goodsId = b.id
        LEFT JOIN goods_type c ON b.typeId = c.id 
    GROUP BY
        b.typeId`;
    return this.nativeQuery(sql);
  }
}
