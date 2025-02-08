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

    const existingSocketId = await this.pubClient.get(`user:${user_id}`);

    if (existingSocketId) {
      // Verificar si el socket ya está activo en alguna instancia
      const existingSocket = this.wss.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        console.log(`🔄 Cliente ya conectado: ${user_id}, usando socket ID existente: ${existingSocketId}`);
        client.emit('connected', { message: 'Conectado al WebSocket con sesión existente' });
        client.disconnect();
        return;
      } else {
        console.log(`🔄 Cliente ${user_id} tiene una sesión huérfana, reasignando nueva conexión.`);
        await this.pubClient.del(`user:${user_id}`); // Eliminar sesión inválida
      }
    }

    console.log(`✅ Nuevo cliente conectado: ${user_id}, socket ID: ${client.id}`);
    await this.pubClient.set(`user:${user_id}`, client.id, { EX: 3600 });

    client.emit('connected', { message: 'Conectado al WebSocket' });
  }

  async handleDisconnect(client: Socket) {
    const userKeys = await this.pubClient.keys('user:*');

    for (const key of userKeys) {
      const socketId = await this.pubClient.get(key);
      if (socketId === client.id) {
        await this.pubClient.del(key);
        console.log(`🚪 Cliente desconectado: ${key.replace('user:', '')}, eliminando de Redis`);
      }
    }
  }
}
