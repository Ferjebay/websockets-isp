import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

  constructor(private readonly appService: AppService) {}

  @Get('/send-message-ws/:usuario_id')
  async sendMessageWs(
    @Param('usuario_id') usuario_id: string,
  ) {
    await this.appService.sendMessageWs(usuario_id);
  }

  @Post('/enviar-notificacion/:usuario_id/:tipo?')
  async enviarNotificacion(
    @Param('usuario_id') usuario_id: string,
    @Param('tipo') tipo: string,
    @Body() info: any
  ) {
    await this.appService.enviarNotificacion(usuario_id, tipo, info);
  }

}
