import { CoolController, BaseController } from '@cool-midway/core';
import { GoodsInfoEntity } from '../../entity/info';
import { GoodsInfoService } from '../../service/info';
import { GoodsTypeEntity } from '../../entity/type';

/**
 * 商品信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: GoodsInfoEntity,
  service: GoodsInfoService,
  pageQueryOp: {
    keyWordLikeFields: ['a.title', 'a.subTitle'],
    select: ['a.*', 'b.name as typeName'],
    fieldEq: ['a.status', 'a.typeId'],
    addOrderBy: {
      sortNum: 'desc',
    },
    join: [
      {
        entity: GoodsTypeEntity,
        alias: 'b',
        condition: 'a.typeId = b.id',
      },
    ],
  },
})
export class AdminGoodsInfoController extends BaseController {}
