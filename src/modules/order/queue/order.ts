import { BaseCoolQueue, CoolQueue } from '@cool-midway/task';
import { Inject } from '@midwayjs/core';
import { OrderInfoService } from '../service/info';

// 行为
export enum Action {
  // 超时未支付
  TIMEOUT = 0,
  // 自动确认收货
  CONFIRM = 1,
}

/**
 * 队列
 */
@CoolQueue()
export abstract class OrderQueue extends BaseCoolQueue {
  @Inject()
  orderInfoService: OrderInfoService;

  async data(job: any, done: any) {
    const action = job.data.action;
    if (action == Action.TIMEOUT) {
      // 关闭订单
      await this.orderInfoService.close(job.data.orderId, '超时未支付');
    }
    if (action == Action.CONFIRM) {
      // 自动确认收货
      await this.orderInfoService.autoConfirm(job.data.orderId);
    }
    done();
  }
}
