import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import * as moment from 'moment';
import { Utils } from '../../../comm/utils';

/**
 * 通用
 */
@Provide()
export class CountCommService extends BaseService {
  @Inject()
  utils: Utils;

  /**
   * 获得时间范围
   * @param unit
   */
  getTimeRange(unit: 'day' | 'week' | 'month' | 'year') {
    let start, end;
    if (unit === 'week') {
      // 周的开始时间加一天，以匹配您的需求
      start = moment()
        .startOf(unit)
        .add(1, 'days')
        .format('YYYY-MM-DD HH:mm:ss');
    } else {
      start = moment().startOf(unit).format('YYYY-MM-DD HH:mm:ss');
    }
    end = moment().endOf(unit).format('YYYY-MM-DD HH:mm:ss');
    return { start, end };
  }

  /**
   * 图表
   * @param tableName
   * @param dayCount
   * @param column 统计列
   * @returns
   */
  async chart(tableName: string, dayCount: number, column = 'count(a.id)') {
    const result = {
      datas: [],
      dates: [],
    };
    const dates = this.utils.getRecentlyDates(dayCount);
    const count = await this.nativeQuery(
      `SELECT
              ${column} as total,
              LEFT(a.createTime, 10) AS time
         FROM
          ${tableName} a
         WHERE
              DATE_SUB( CURDATE( ), INTERVAL ? DAY ) <= a.createTime 
         GROUP BY
              LEFT(a.createTime, 10)`,
      [dayCount]
    );
    dates.forEach(date => {
      let data = 0;
      for (const item of count) {
        if (date == item.time) {
          data = item.total;
          break;
        }
      }
      result.dates.push(date);
      result.datas.push(data);
    });
    return result;
  }
}
