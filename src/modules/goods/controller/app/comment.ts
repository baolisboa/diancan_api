import {
  CoolController,
  BaseController,
  TagTypes,
  CoolUrlTag,
} from '@cool-midway/core';
import { GoodsCommentEntity } from '../../entity/comment';
import { UserInfoEntity } from '../../../user/entity/info';
import { Body, Inject, Post } from '@midwayjs/core';
import { GoodsCommentService } from '../../service/comment';

/**
 * 商品评论
 */
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page'],
})
@CoolController({
  api: ['page'],
  entity: GoodsCommentEntity,
  insertParam: ctx => {
    return {
      userId: ctx.user.id,
    };
  },
  pageQueryOp: {
    fieldEq: ['a.goodsId', 'a.orderId'],
    select: ['a.*', 'b.nickName', 'b.avatarUrl'],
    join: [
      {
        entity: UserInfoEntity,
        alias: 'b',
        condition: 'a.userId = b.id',
      },
    ],
  },
})
export class AppGoodsCommentController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  goodsCommentService: GoodsCommentService;

  @Post('/submit', { summary: '提交评论' })
  async submit(
    @Body('data') data: GoodsCommentEntity,
    @Body('orderId') orderId: number
  ) {
    return this.ok(
      await this.goodsCommentService.submit(this.ctx.user.id, orderId, data)
    );
  }
}
