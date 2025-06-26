import { Injectable } from '@nestjs/common';
import { MessagesWsService } from './messages-ws/messages-ws.service';

@Injectable()
export class AppService {

  constructor(
    private readonly messageWsService: MessagesWsService,
  ) {}

  sendMessageWs(usuario_id: string) {
    this.messageWsService.updateStateInvoice(usuario_id)
  }

  enviarNotificacion(usuario_id: string, tipo: string, info: any) {
    this.messageWsService.enviarNotificacion(usuario_id, tipo, info)
  }

}
