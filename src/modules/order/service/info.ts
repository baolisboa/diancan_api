import { BaseService, CoolCommException } from '@cool-midway/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { Init, Inject, InjectClient, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import BigNumber from 'bignumber.js';
import * as moment from 'moment';
import { Equal, Repository } from 'typeorm';
import { BaseSysParamService } from '../../base/service/sys/param';
import { GoodsSpecEntity } from '../../goods/entity/spec';
import { MarketCouponUserEntity } from '../../market/entity/coupon/user';
import { MarketCouponInfoService } from '../../market/service/coupon/info';
import { PluginService } from '../../plugin/service/info';
import { ShopInfoEntity } from '../../shop/entity/info';
import { UserAddressService } from '../../user/service/address';
import { OrderGoodsEntity } from '../entity/goods';
import { OrderInfoEntity } from '../entity/info';
import { Action, OrderQueue } from '../queue/order';
import { OrderGoodsService } from './goods';
import { OrderPayService } from './pay';

/**
 * 订单信息
 */
@Provide()
export class OrderInfoService extends BaseService {
  @InjectEntityModel(OrderInfoEntity)
  orderInfoEntity: Repository<OrderInfoEntity>;

  @InjectEntityModel(GoodsSpecEntity)
  goodsSpecEntity: Repository<GoodsSpecEntity>;

  @InjectEntityModel(ShopInfoEntity)
  shopInfoEntity: Repository<ShopInfoEntity>;

  @InjectEntityModel(MarketCouponUserEntity)
  marketCouponUserEntity: Repository<MarketCouponUserEntity>;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @Inject()
  orderGoodsService: OrderGoodsService;

  @Inject()
  userAddressService: UserAddressService;

  @Inject()
  orderPayService: OrderPayService;

  @Inject()
  orderQueue: OrderQueue;

  @Inject()
  pluginService: PluginService;

  @Inject()
  marketCouponInfoService: MarketCouponInfoService;

  @Inject()
  baseSysParamService: BaseSysParamService;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.orderInfoEntity);
  }

  /**
   * 修改前
   * @param data
   * @param type
   */
  async modifyBefore(data: any, type: 'add' | 'update' | 'delete') {
    if (type == 'add' || type == 'update') {
      delete data.refundStatus;
      delete data.refundApplyTime;
    }
  }

  /**
   * 分页查询
   * @param query
   * @param option
   * @param connectionName
   */
  async page(query: any, option: any, connectionName?: any) {
    const result = await super.page(query, option, connectionName);
    // 筛选条件的非分页sql
    const countSql = await super.getOptionFind(query, option);

    const countResult = await this.nativeQuery(
      `SELECT COUNT(a.id) as totalCount, SUM(a.price) as totalPrice FROM ${
        countSql.split('FROM')[1].split('ORDER BY')[0]
      }`
    );

    result['subData'] = {
      totalCount: countResult[0].totalCount,
      totalPrice: countResult[0].totalPrice,
    };

    const goodsList = await this.orderGoodsService.getByOrderIds(
      result.list.map(e => e.id)
    );
    for (const item of result.list) {
      item.goodsList = goodsList.filter(e => e.orderId == item.id);
    }
    return result;
  }

  /**
   * 根据订单号获取订单
   * @param orderNum
   * @returns
   */
  async getByOrderNum(orderNum: string) {
    return this.orderInfoEntity.findOneBy({
      orderNum: Equal(orderNum),
    });
  }

  /**
   * 修改订单状态
   * @param id
   * @param status
   */
  async changeStatus(id: number, status: number) {
    await this.orderInfoEntity.update({ id }, { status });
  }

  /**
   * 关闭订单
   * @param orderId
   * @param remark
   */
  async close(orderId: number, remark: string) {
    const order = await this.info(orderId);
    if (!order || !remark)
      throw new CoolCommException('订单不存在或备注不能为空');
    if (order.status != 0) {
      throw new CoolCommException('订单状态不允许关闭');
    }

    // 退回优惠券
    if (order.discountSource && order.discountPrice > 0) {
      if (order.discountSource.type == 0) {
        this.marketCouponUserEntity.update(
          {
            id: order.discountSource.objectId,
          },
          {
            status: 0,
          }
        );
      }
    }

    await this.orderInfoEntity.update(
      { id: orderId },
      { status: 7, closeRemark: remark }
    );

    // 释放库存
    await this.orderGoodsService.updateStock(order.goodsList, 'add');
  }

  /**
   * 订单详情
   * @param id
   * @param infoIgnoreProperty
   */
  async info(id: any, infoIgnoreProperty?: string[]) {
    const info = await super.info(id, infoIgnoreProperty);
    if (!info) {
      throw new CoolCommException('订单不存在');
    }
    if (info) {
      // 获取店铺
      info.shop = await this.shopInfoEntity.findOneBy(info.shopId);
      // 获取商品
      info.goodsList = await this.orderGoodsService.getByOrderId(info.id);
    }
    return info;
  }

  /**
   * 生成取餐号
   */
  async getTakeNum() {
    const tnKey = `${moment().format('YYYY-MM-DD')}_take_num`;

    let takeNum: number = await this.midwayCache.get(tnKey);

    if (!takeNum) {
      takeNum = 1;
    } else {
      takeNum += 1;
    }

    await this.midwayCache.set(tnKey, takeNum, 3600 * 24 * 2 * 1000);

    return `T${takeNum.toString().padStart(4, '0')}`;
  }

  /**
   * 创建订单
   * @param data
   */
  async create(data: {
    userId: number;
    goodsList: OrderGoodsEntity[];
    addressId: number;
    remark: string;
    phone: string;
    title: string;
    type: number;
    shopId?: number;
    couponId?: number;
  }) {
    const order = {
      userId: data.userId,
      shopId: data.shopId,
      remark: data.remark,
      phone: data.phone,
      title: data.title,
      goodsList: data.goodsList,
      type: data.type,
    } as OrderInfoEntity;

    order.takeNum = await this.getTakeNum();

    if (data.type == 1) {
      order.address = await this.userAddressService.info(data.addressId);
    }

    order.price = await this.orderGoodsService.getTotalPrice(data.goodsList);
    // @ts-ignore
    order['goodsList'] = data.goodsList.map(e => {
      return {
        ...e,
        shopId: data.shopId,
      };
    });

    // 使用优惠券
    if (data.couponId) {
      await this.marketCouponInfoService.checkAndUse(
        data.couponId,
        data.userId,
        order
      );
    }

    await this.orderInfoEntity.insert(order);

    // 生成订单号
    const orderNum = await this.generateOrderNum(order.id);

    // 更新订单
    await this.orderInfoEntity.update(order.id, {
      orderNum,
    });

    // 保存订单商品
    await this.orderGoodsService.save(order.id, order['goodsList']);

    const orderTimeout = await this.baseSysParamService.dataByKey(
      'orderTimeout'
    );
    // 发送订单创建消息
    this.orderQueue.add(
      { orderId: order.id, action: Action.TIMEOUT },
      {
        // 超时关闭订单
        delay: orderTimeout * 60 * 1000,
      }
    );
    return order;
  }

  /**
   * 生成订单号
   * @param orderId
   */
  async generateOrderNum(orderId: number, label = 'U') {
    const orderNum =
      moment().format('YYYYMMDDHHmmss') +
      Math.floor(Math.random() * 10000).toString() +
      orderId.toString();
    return label + orderNum;
  }

  /**
   * 退款
   * @param userId
   * @param orderId
   * @param goodsId
   * @param reason
   */
  async refund(userId: number, orderId: number, reason: string) {
    const order = await this.info(orderId);
    if (order && order.userId != userId) {
      throw new CoolCommException('非法操作');
    }
    if (![1, 2].includes(order.status)) {
      throw new CoolCommException('订单状态不允许退款');
    }

    await this.orderInfoEntity.update(
      { id: Equal(orderId) },
      {
        status: 5,
        refund: {
          amount: new BigNumber(order.price)
            .minus(order.discountPrice)
            .toNumber(),
          status: 0,
          applyTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          reason,
          orderNum: 'R' + order.orderNum.slice(1),
        },
      }
    );
  }

  /**
   * 退款处理
   * @param orderId
   * @param action 0-拒绝 1-同意
   * @param refuseReason 0-拒绝 1-同意
   */
  async refundHandle(orderId: number, action: number, refuseReason: string) {
    const order = await this.info(orderId);
    if (order.status != 5 || !order.refund) {
      throw new CoolCommException('订单状态不允许退款处理');
    }
    // 拒绝退款
    if (action == 0) {
      await this.orderInfoEntity.update(
        { id: Equal(orderId) },
        {
          status: 4,
          refund: {
            ...order.refund,
            status: 2,
            refuseReason: refuseReason,
          },
        }
      );
    }
    // 同意退款
    if (action == 1) {
      const amount = order.refund.amount;

      if (amount > order.price) {
        throw new CoolCommException('退款金额不能大于订单金额');
      }

      // 执行退款操作
      const result = await this.orderPayService.wxRefund(order, amount);

      if (result) {
        await this.orderInfoEntity.update(
          { id: Equal(orderId) },
          {
            status: 6,
            refund: {
              ...order.refund,
              status: 1,
              realAmount: amount,
              time: moment().format('YYYY-MM-DD HH:mm:ss'),
            },
          }
        );
      }
    }
  }

  /**
   * 确认收货
   * @param userId
   * @param orderId
   */
  async confirm(orderId: number, userId: number) {
    const order = await this.info(orderId);
    if (order && order.userId != userId) {
      throw new CoolCommException('非法操作');
    }
    if (![2].includes(order.status)) {
      throw new CoolCommException('订单状态不允许退款');
    }
    await this.orderInfoEntity.update(
      { id: Equal(orderId) },
      {
        status: 4,
      }
    );
  }

  /**
   * 自动确认收货
   * @param orderId
   * @returns
   */
  async autoConfirm(orderId: number) {
    const info = await this.orderInfoEntity.findOneBy({ id: Equal(orderId) });
    if (info.status != 2) {
      return;
    }
    await this.orderInfoEntity.update({ id: Equal(orderId) }, { status: 4 });
  }

  /**
   * 物流信息
   * @param orderId
   */
  async logistics(orderId: number, userId?: number) {
    const order: OrderInfoEntity = await this.info(orderId);
    if (userId && order.userId != userId) {
      throw new CoolCommException('非法操作');
    }
    const no = order.logistics?.num;

    if (!no) {
      return null;
    }

    const instance = await this.pluginService.getInstance('wuliu');
    return await instance.query(no);
  }

  /**
   * 发货
   * @param orderId
   * @param logistics
   */
  async deliver(
    orderId: number,
    logistics: {
      // 物流公司
      company: string;
      // 物流单号
      num: string;
    }
  ) {
    const order: OrderInfoEntity = await this.info(orderId);
    if (order.status != 1) {
      throw new CoolCommException('订单状态不允许发货');
    }
    await this.orderInfoEntity.update(orderId, {
      status: 2,
      logistics,
    });
  }

  /**
   * 用户订单数量
   * @param userId
   */
  async userCount(userId: number) {
    const statusLabels = [
      '待付款',
      '待发货',
      '待收货',
      '待评价',
      '交易完成',
      '退款中',
      '已退款',
      '已关闭',
    ];
    // 生成查询字符串
    const selectQueries = statusLabels.map(
      (label, index) =>
        `SUM(CASE WHEN status = ${index} THEN 1 ELSE 0 END) AS '${label}'`
    );
    const list = await this.orderInfoEntity
      .createQueryBuilder('a')
      .select(selectQueries)
      .where('a.userId = :userId', { userId })
      .getRawMany();
    return list[0];
  }
}
