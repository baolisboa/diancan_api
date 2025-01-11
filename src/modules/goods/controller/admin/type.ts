import { CoolController, BaseController } from '@cool-midway/core';
import { GoodsTypeEntity } from '../../entity/type';
import { GoodsTypeService } from '../../service/type';

/**
 * 分类
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: GoodsTypeEntity,
  service: GoodsTypeService,
  listQueryOp: {
    keyWordLikeFields: ['name'],
  },
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['parentId'],
  },
})
export class AdminGoodsTypeController extends BaseController {}
