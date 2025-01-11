import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject, Post } from '@midwayjs/core';
import { CsSessionService } from '../../service/session';

/**
 * 客服会话
 */
@CoolController()
export class Controller extends BaseController {
  @Inject()
  csSessionService: CsSessionService;

  @Inject()
  ctx;

  @Get('/detail', { summary: '会话详情' })
  async detail() {
    return this.ok(await this.csSessionService.detail(this.ctx.user?.id));
  }

  @Post('/create', { summary: '创建会话' })
  async create() {
    return this.ok(await this.csSessionService.create(this.ctx.user?.id));
  }
}
