import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { GoodsInfoEntity } from '../entity/info';
import { GoodsSpecService } from './spec';

/**
 * 商品信息
 */
@Provide()
export class GoodsInfoService extends BaseService {
  @InjectEntityModel(GoodsInfoEntity)
  goodsInfoEntity: Repository<GoodsInfoEntity>;

  @Inject()
  goodsSpecService: GoodsSpecService;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.goodsInfoEntity);
  }

  /**
   * 修改之后
   * @param data
   * @param type
   */
  async modifyAfter(data: any, type: 'add' | 'update' | 'delete') {
    if ((type == 'add' || type == 'update') && data.specs) {
      // 保存规格
      // await this.goodsSpecService.save(data.id, data.specs);
    }
    if (type == 'delete') {
      // 删除规格
      await this.goodsSpecService.removeByGoodsId([data.id]);
    }
  }
}
