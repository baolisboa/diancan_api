import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfoEntity } from '../../user/entity/info';
import { CountCommService } from './comm';

/**
 * 用户统计
 */
@Provide()
export class CountUserService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Inject()
  countCommService: CountCommService;

  /**
   * 概况
   */
  async summary() {
    // 定义一个函数来创建查询
    const createQuery = async (start, end) => {
      return await this.userInfoEntity
        .createQueryBuilder('a')
        .where('a.createTime >= :start', { start })
        .andWhere('a.createTime <= :end', { end })
        .getCount();
    };

    // 总数
    const total = await this.userInfoEntity.count();

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
   */
  async chart(dayCount = 30) {
    return await this.countCommService.chart('user_info', dayCount);
  }
}
