import { Module } from '@nestjs/common';
import { MessagesWsService } from './messages-ws.service';
import { CacheModule } from '@nestjs/cache-manager';
import { MessagesWsGateway } from './messages-ws.gateway';

@Module({
  providers: [MessagesWsGateway, MessagesWsService],
  imports: [CacheModule.register()],
  exports: [ MessagesWsService ]
})
export class MessagesWsModule {}
