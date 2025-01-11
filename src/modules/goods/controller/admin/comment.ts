import { CoolController, BaseController } from '@cool-midway/core';
import { GoodsCommentEntity } from '../../entity/comment';
import { UserInfoEntity } from '../../../user/entity/info';
import { GoodsInfoEntity } from '../../entity/info';

/**
 * 商品评论
 */
@CoolController({
  api: ['page'],
  entity: GoodsCommentEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.content', 'b.nickName'],
    fieldEq: ['a.goodsId'],
    select: ['a.*', 'b.nickName', 'b.avatarUrl', 'c.title', 'c.mainPic'],
    join: [
      {
        entity: UserInfoEntity,
        alias: 'b',
        condition: 'a.userId = b.id',
      },
      {
        entity: GoodsInfoEntity,
        alias: 'c',
        condition: 'a.goodsId = c.id',
      },
    ],
  },
})
export class AdminGoodsCommentController extends BaseController {}
