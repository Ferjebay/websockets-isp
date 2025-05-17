import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } }) // Permitir conexiones desde cualquier origen
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer() wss: Server;
  private pubClient;
  private subClient;

  constructor(private readonly messagesWsService: MessagesWsService) {}

  async onModuleInit() {
    this.pubClient = createClient({ url: 'redis://127.0.0.1:6379' });
    this.subClient = this.pubClient.duplicate();

    await this.pubClient.connect();
    await this.subClient.connect();

    this.wss.adapter(createAdapter(this.pubClient, this.subClient));
    console.log("✅ WebSocket Adapter de Redis configurado correctamente.");

    this.messagesWsService.setWebSocketServer(this.wss);
  }

  async handleConnection(client: Socket) {
    const user_id = client.handshake.headers.autentication;

    if (!user_id) {
      console.error(`❌ ERROR: Se intentó registrar un cliente sin userId.`);
      client.disconnect();
      return;
    }

    console.log(`✅ Nuevo cliente conectado: ${user_id}, socket ID: ${client.id}`);
    await this.pubClient.sAdd(`user:${user_id}`, client.id);
    await this.pubClient.expire(`user:${user_id}`, 3600);

    client.emit('connected', { message: 'Conectado al WebSocket' });
  }

  handleDisconnect(client: Socket) {
    const user_id = client.handshake.headers.autentication;
    if (user_id) {
      this.pubClient.sRem(`user:${user_id}`, client.id);
    }
  }

}
