import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { Equal, Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { UserVipEntity } from '../entity/vip';
import { UserInfoEntity } from '../entity/info';

/**
 * 会员
 */
@Provide()
export class UserVipService extends BaseService {
  @InjectEntityModel(UserVipEntity)
  userVipEntity: Repository<UserVipEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Inject()
  ctx;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.userVipEntity);
  }

  /**
   * 加积分
   */
  async addScore(userId: number, score: number) {
    const user = await this.userInfoEntity.findOneBy({
      id: Equal(userId),
    });

    if (user) {
      user.score += Math.ceil(score);

      // 下一个等级
      const next = await this.userVipEntity.findOneBy({
        level: user.level + 1,
      });

      // 判断是否升级
      if (user.score >= next.score) {
        user.level += 1;
      }

      // 更新
      await this.userInfoEntity.save(user);
    }
  }
}
