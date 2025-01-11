import { CoolController, BaseController } from '@cool-midway/core';
import { GoodsSearchKeywordEntity } from '../../entity/searchKeyword';

/**
 * 商品信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: GoodsSearchKeywordEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name'],
  },
})
export class AppGoodsSearchKeywordController extends BaseController {}
