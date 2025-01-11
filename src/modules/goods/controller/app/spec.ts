import {
  CoolController,
  BaseController,
  TagTypes,
  CoolUrlTag,
} from '@cool-midway/core';
import { GoodsSpecEntity } from '../../entity/spec';

/**
 * 分类
 */
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['list'],
})
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: GoodsSpecEntity,
  listQueryOp: {
    fieldEq: ['goodsId'],
  },
})
export class AppGoodsSpecController extends BaseController {}
