import { CoolController, BaseController } from '@cool-midway/core';
import { GoodsSpecEntity } from '../../entity/spec';

/**
 * 分类
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: GoodsSpecEntity,
  listQueryOp: {
    fieldEq: ['goodsId'],
  },
})
export class AdminGoodsSpecController extends BaseController {}
