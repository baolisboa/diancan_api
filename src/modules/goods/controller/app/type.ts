import {
  CoolController,
  BaseController,
  TagTypes,
  CoolUrlTag,
} from '@cool-midway/core';
import { GoodsTypeEntity } from '../../entity/type';

/**
 * 分类
 */
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['list'],
})
@CoolController({
  api: ['list'],
  entity: GoodsTypeEntity,
  listQueryOp: {
    keyWordLikeFields: ['a.name'],
    addOrderBy: {
      sortNum: 'desc',
    },
    where: () => {
      return [['a.status =:status', { status: 1 }]];
    },
  },
})
export class AppGoodsTypeController extends BaseController {}
