import {
  WSController,
  OnWSConnection,
  Inject,
  OnWSMessage,
} from '@midwayjs/decorator';
import { CsConnService } from '../service/conn';
import { CsSocketTokenMiddleware } from './middleware/token';
import { CsMsgService } from '../service/msg';
/**
 * code-socket
 */
@WSController('/cs')
export class CsSocketIoController {
  @Inject()
  ctx;

  @Inject()
  csConnService: CsConnService;

  @Inject()
  csMsgService: CsMsgService;

  // 客户端连接
  @OnWSConnection({ middleware: [CsSocketTokenMiddleware] })
  async onConnectionMethod() {
    const { isAdmin, userId } = this.ctx.connData;
    await this.csConnService.binding(isAdmin, userId, this.ctx.id);
    this.ctx.emit('message', '连接成功');
  }

  // 发送消息
  @OnWSMessage('send', { middleware: [CsSocketTokenMiddleware] })
  async send(data) {
    const { isAdmin, userId } = this.ctx.connData;
    const { sessionId, content } = data;
    await this.csMsgService.send(
      {
        userId,
        sessionId,
        content,
      },
      isAdmin
    );
  }
}
