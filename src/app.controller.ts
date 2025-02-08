import { Controller, Get, Param } from '@nestjs/common';
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

}
