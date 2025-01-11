import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { CountUserService } from '../../service/user';
import { CountOrderService } from '../../service/order';
import { CountGoodsService } from '../../service/goods';
import { CountShopService } from '../../service/shop';

/**
 * 首页统计
 */
@CoolController()
export class AdminCountHomeController extends BaseController {
  @Inject()
  countUserService: CountUserService;

  @Inject()
  countOrderService: CountOrderService;

  @Inject()
  countGoodsService: CountGoodsService;

  @Inject()
  countShopService: CountShopService;

  @Post('/userSummary', { summary: '用户概况' })
  async userSummary() {
    return this.ok(await this.countUserService.summary());
  }

  @Post('/userChart', { summary: '用户图表' })
  async userChart(
    // 天数
    @Body('dayCount') dayCount: number
  ) {
    return this.ok(await this.countUserService.chart(dayCount));
  }

  @Post('/orderSummary', { summary: '订单概况' })
  async orderSummary(
    // 类型 count-数量 amount-金额
    @Body('type') type: 'count' | 'amount'
  ) {
    return this.ok(await this.countOrderService.summary(type));
  }

  @Post('/orderChart', { summary: '订单图表' })
  async orderChart(
    // 天数
    @Body('dayCount') dayCount: number,
    // 类型 count-数量 amount-金额
    @Body('type') type: 'count' | 'amount'
  ) {
    return this.ok(await this.countOrderService.chart(dayCount, type));
  }

  @Post('/goodsRank', { summary: '商品排行' })
  async goodsRank(
    // 类型 count-数量 amount-金额
    @Body('type') type: 'count' | 'amount',
    // 条数
    @Body('limit') limit: number
  ) {
    return this.ok(await this.countGoodsService.rank(type, limit));
  }

  @Post('/shopRank', { summary: '门店排行' })
  async shopRank(
    // 类型 count-数量 amount-金额
    @Body('type') type: 'count' | 'amount',
    // 条数
    @Body('limit') limit: number
  ) {
    return this.ok(await this.countShopService.rank(type, limit));
  }

  @Post('/goodsCategory', { summary: '商品分类' })
  async goodsCategory(
    // 类型 count-数量 amount-金额
    @Body('type') type: 'count' | 'amount'
  ) {
    return this.ok(await this.countGoodsService.category(type));
  }
}
