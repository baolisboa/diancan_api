import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { PluginService } from '../../plugin/service/info';
import { OrderInfoService } from './info';
import { UserWxService } from '../../user/service/wx';
import BigNumber from 'bignumber.js';
import { OrderInfoEntity } from '../entity/info';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Action, OrderQueue } from '../queue/order';
import { BaseSysParamService } from '../../base/service/sys/param';
import { UserVipService } from '../../user/service/vip';

/**
 * 支付
 */
@Provide()
export class OrderPayService extends BaseService {
  @InjectEntityModel(OrderInfoEntity)
  orderInfoEntity: Repository<OrderInfoEntity>;

  @Inject()
  pluginService: PluginService;

  @Inject()
  orderInfoService: OrderInfoService;

  @Inject()
  userWxService: UserWxService;

  @Inject()
  orderQueue: OrderQueue;

  @Inject()
  baseSysParamService: BaseSysParamService;

  @Inject()
  userVipService: UserVipService;

  @Init()
  async init() {
    await super.init();
  }

  /**
   * 支付成功
   * @param orderNum 订单号
   * @param payType 支付方式 0-待支付 1-微信 2-支付宝
   */
  async paySuccess(orderNum: string, payType: number) {
    const order = await this.orderInfoService.getByOrderNum(orderNum);
    if (order && order.status == 0) {
      await this.orderInfoEntity.update(order.id, {
        payType,
        status: 1,
        payTime: new Date(),
      });

      // 加积分
      this.userVipService.addScore(order.userId, order.price);

      // 发送自动确认收货队列
      const orderConfirm = await this.baseSysParamService.dataByKey(
        'orderConfirm'
      );
      this.orderQueue.add(
        { orderId: order.id, action: Action.CONFIRM },
        {
          // 自动确认收货时间
          delay: orderConfirm * 60 * 60 * 1000,
        }
      );
    }
    return 'success';
  }

  /**
   * 微信小程序支付
   * @param userId
   * @param orderId
   */
  async wxMiniPay(orderId: number, userId: number) {
    await this.orderInfoEntity.update(orderId, { wxType: 0 });
    return await this.wxJSAPI(orderId, userId, 0);
  }

  /**
   * 微信公众号支付
   * @param userId
   * @param orderId
   */
  async wxMpPay(orderId: number, userId: number) {
    await this.orderInfoEntity.update(orderId, { wxType: 1 });
    return await this.wxJSAPI(orderId, userId, 1);
  }

  /**
   * 获得appid
   * @param type 0-小程序 1-公众号 2-App
   */
  async getAppidByType(type: number) {
    let account;
    const plugin = await this.pluginService.getInstance('wx');
    // 小程序
    if (type == 0) {
      account = (await plugin.MiniApp()).getAccount();
    }
    // 公众号
    if (type == 1) {
      account = (await plugin.OfficialAccount()).getAccount();
    }
    // App
    if (type == 2) {
      account = (await plugin.OpenPlatform()).getAccount();
    }
    // 获得appid
    const appid = account.getAppId();
    return appid;
  }

  /**
   * 获得微信支付 SDK 实例
   * @param type 0-小程序 1-公众号 2-App
   * @returns
   */
  async wxPayInstance(appid: string) {
    // 获得插件实例
    const plugin = await this.pluginService.getInstance('pay-wx');
    // 获得插件配置
    const config = await plugin.getConfig();
    // 获得微信支付 SDK 实例
    const instance = await plugin.getInstance({
      ...config,
      appid,
    });
    return { config, instance };
  }

  /**
   * 微信APP支付
   * @param orderId
   * @param userId
   * @returns
   */
  async wxAppPay(orderId: number, userId: number) {
    const appid = await this.getAppidByType(2);

    const { config, instance } = await this.wxPayInstance(appid);

    const order = await this.getOrder(orderId, userId);
    const params = {
      description: '商品采购',
      out_trade_no: order?.orderNum,
      notify_url: config.notify_url,
      amount: {
        total: new BigNumber(order.price)
          .minus(order.discountPrice || 0)
          .multipliedBy(100)
          .toNumber(),
      },
    };

    const result = await instance.transactions_app(params);
    return result;
  }

  /**
   * 获得订单
   * @param orderId
   * @param userId
   * @returns
   */
  async getOrder(orderId: number, userId: number) {
    const order: OrderInfoEntity = await this.orderInfoService.info(orderId);
    if (!order || order.status != 0 || order.userId != userId) {
      throw new CoolCommException('订单不存在或不是可以支付的状态');
    }
    return order;
  }

  /**
   * 微信JSAPI
   * @param orderId
   * @param userId
   * @param type 0-小程序 1-公众号 2-App
   * @returns
   */
  async wxJSAPI(orderId: number, userId: number, type = 0) {
    const order = await this.getOrder(orderId, userId);
    const openid = await this.userWxService.getOpenid(userId, type);

    const appid = await this.getAppidByType(type);

    const { config, instance } = await this.wxPayInstance(appid);

    const params = {
      description: '商品采购',
      out_trade_no: order.orderNum,
      notify_url: config.notify_url,
      amount: {
        total: new BigNumber(order.price)
          .minus(order.discountPrice || 0)
          .multipliedBy(100)
          .toNumber(),
      },
      payer: {
        openid,
      },
      scene_info: {
        payer_client_ip: '127.0.0.1',
      },
    };
    const result = await instance.transactions_jsapi(params);
    return result;
  }

  /**
   * 微信退款
   * @param order
   * @param amount
   * @returns
   */
  async wxRefund(order: OrderInfoEntity, amount: number) {
    const appid = await this.getAppidByType(order.wxType);
    const { config, instance } = await this.wxPayInstance(appid);
    const params = {
      out_trade_no: order.orderNum,
      out_refund_no: order.refund.orderNum,
      notify_url: config.notify_url,
      amount: {
        refund: new BigNumber(amount).multipliedBy(100).toNumber(),
        total: new BigNumber(order.refund.amount).multipliedBy(100).toNumber(),
        currency: 'CNY',
      },
    };
    const result = await instance.refunds(params);
    if (
      result.status == 200 ||
      result.status == 'SUCCESS' ||
      result.status == 'PROCESSING'
    ) {
      return true;
    }
    throw new CoolCommException(result.message);
  }
}
