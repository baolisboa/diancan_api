import { Init, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, In, Repository } from 'typeorm';
import { GoodsSpecEntity } from '../entity/spec';

/**
 * 规格
 */
@Provide()
export class GoodsSpecService extends BaseService {
  @InjectEntityModel(GoodsSpecEntity)
  goodsSpecEntity: Repository<GoodsSpecEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.goodsSpecEntity);
  }

  /**
   * 保持规格
   * @param goodsId
   * @param specs
   */
  async save(goodsId: number, specs: GoodsSpecEntity[]) {
    // 先删除原来的规格
    await this.goodsSpecEntity.delete({ goodsId });
    // 保存新的规格
    await this.goodsSpecEntity.save(
      specs.map(item => {
        item.goodsId = goodsId;
        return item;
      })
    );
  }

  /**
   * 通过商品ID获取规格
   * @param goodsId
   */
  async removeByGoodsId(goodsIds: number[]) {
    await this.goodsSpecEntity.delete({ goodsId: In(goodsIds) });
  }

  /**
   * 通过商品ID获取规格
   * @param goodsId
   * @returns
   */
  async getByGoodsId(goodsId: number) {
    return await this.goodsSpecEntity.findBy({ goodsId: Equal(goodsId) });
  }

  /**
   * 更新库存
   * @param specId 规格ID
   * @param count 数量
   */
  async updateStock(specId: number, count: number) {
    await this.goodsSpecEntity.increment({ id: specId }, 'stock', count);

    // 更新后检查库存，如果小于0则设置为0
    const spec = await this.goodsSpecEntity.findOneBy({ id: Equal(specId) });
    if (spec && spec.stock < 0) {
      await this.goodsSpecEntity.update(spec.id, {
        stock: 0,
      });
    }
  }
}
