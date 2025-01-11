import { Init, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { GoodsTypeEntity } from '../entity/type';

/**
 * 商品类型
 */
@Provide()
export class GoodsTypeService extends BaseService {
  @InjectEntityModel(GoodsTypeEntity)
  goodsTypeEntity: Repository<GoodsTypeEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.goodsTypeEntity);
  }

  /**
   * 删除
   * @param ids
   */
  async delete(ids: any) {
    await super.delete(ids);
    // 删除子集
    await this.goodsTypeEntity.delete({ parentId: In(ids) });
  }
}
