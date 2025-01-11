import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { OrderGoodsEntity } from '../../order/entity/goods';

/**
 * 门店统计
 */
@Provide()
export class CountShopService extends BaseService {
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
        a.shopId,
        b.name as shopName,
        SUM(a.count) as count,
        SUM(a.price * a.count) as amount
    FROM
        order_goods a
        LEFT JOIN shop_info b ON a.shopId = b.id 
    GROUP BY
        a.shopId
    ) a 
    ORDER BY
        amount DESC
    LIMIT ${parseInt(limit.toString())}`;
    return this.nativeQuery(sql);
  }
}
