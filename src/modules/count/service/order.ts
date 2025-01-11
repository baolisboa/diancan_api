import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { OrderInfoEntity } from '../../order/entity/info';
import { CountCommService } from './comm';

/**
 * 订单统计
 */
@Provide()
export class CountOrderService extends BaseService {
  @InjectEntityModel(OrderInfoEntity)
  orderInfoEntity: Repository<OrderInfoEntity>;

  @Inject()
  countCommService: CountCommService;

  /**
   * 概况
   * @param type 类型 count-数量 amount-金额
   * @returns
   */
  async summary(type: 'count' | 'amount' = 'count') {
    // 定义一个函数来创建查询
    const createQuery = async (start, end) => {
      if (type === 'count') {
        return await this.orderInfoEntity
          .createQueryBuilder('a')
          .where('a.createTime >= :start', { start })
          .andWhere('a.createTime <= :end', { end })
          .getCount();
      }
      if (type === 'amount') {
        const result = await this.orderInfoEntity
          .createQueryBuilder('a')
          .select('SUM(a.price)', 'amount')
          .where('a.createTime >= :start', { start })
          .andWhere('a.createTime <= :end', { end })
          .getRawOne();
        return result.amount || 0;
      }
    };

    // 总数
    const total = await (type == 'amount'
      ? this.orderInfoEntity.sum('price')
      : this.orderInfoEntity.count());

    // 获取今天的时间范围
    const { start: todayStart, end: todayEnd } =
      this.countCommService.getTimeRange('day');
    // 今天
    const today = await createQuery(todayStart, todayEnd);

    // 获取本周的时间范围
    const { start: weekStart, end: weekEnd } =
      this.countCommService.getTimeRange('week');
    // 本周
    const week = await createQuery(weekStart, weekEnd);

    // 获取本月的时间范围
    const { start: monthStart, end: monthEnd } =
      this.countCommService.getTimeRange('month');
    // 本月
    const month = await createQuery(monthStart, monthEnd);

    // 获取年的时间范围
    const { start: yearStart, end: yearEnd } =
      this.countCommService.getTimeRange('year');
    // 今年
    const year = await createQuery(yearStart, yearEnd);

    return { total, today, week, month, year };
  }

  /**
   * 图表
   * @param dayCount 最近多少天
   * @param type 类型 count-数量 amount-金额
   */
  async chart(dayCount = 30, type: 'count' | 'amount' = 'count') {
    if (type == 'count') {
      return await this.countCommService.chart('order_info', dayCount);
    }
    if (type == 'amount') {
      return await this.countCommService.chart(
        'order_info',
        dayCount,
        'SUM(a.price)'
      );
    }
  }
}
