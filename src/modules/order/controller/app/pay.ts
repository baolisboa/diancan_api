import {
  CoolController,
  BaseController,
  CoolUrlTag,
  CoolTag,
  TagTypes,
} from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { PluginService } from '../../../plugin/service/info';
import { OrderPayService } from '../../service/pay';

/**
 * 支付
 */
@CoolUrlTag()
@CoolController()
export class OrderPayController extends BaseController {
  @Inject()
  pluginService: PluginService;

  @Inject()
  orderPayService: OrderPayService;

  @Inject()
  ctx;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/wxNotify', { summary: '微信支付回调' })
  async wxNotify(@Body() body) {
    // 获得插件实例
    const plugin = await this.pluginService.getInstance('pay-wx');
    // 获得微信支付 SDK 实例
    const instance = await plugin.getInstance();
    const { ciphertext, associated_data, nonce } = body.resource;
    const data: any = instance.decipher_gcm(ciphertext, associated_data, nonce);
    const check = await plugin.signVerify(this.ctx);
    // 验签通过，处理业务逻辑
    if (check && data.trade_state == 'SUCCESS') {
      return await this.orderPayService.paySuccess(data.out_trade_no, 1);
    }
    return 'fail';
  }

  @Post('/wxMiniPay', { summary: '微信小程序支付' })
  async wxMiniPay(@Body('orderId') orderId) {
    return this.ok(
      await this.orderPayService.wxMiniPay(orderId, this.ctx.user.id)
    );
  }

  @Post('/wxMpPay', { summary: '微信公众号支付' })
  async wxMpPay(@Body('orderId') orderId) {
    return this.ok(
      await this.orderPayService.wxMpPay(orderId, this.ctx.user.id)
    );
  }

  @Post('/wxAppPay', { summary: '微信APP支付' })
  async wxAppPay(@Body('orderId') orderId) {
    return this.ok(
      await this.orderPayService.wxAppPay(orderId, this.ctx.user.id)
    );
  }
}
