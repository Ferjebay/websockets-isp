import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { Server } from 'socket.io';

@Injectable()
export class MessagesWsService {
  private redisClient;
  private wss: Server;

  constructor() {
    this.redisClient = createClient({ url: 'redis://127.0.0.1:6379' });

    this.redisClient.on('error', (err) => console.error('❌ Error en Redis:', err));
    this.redisClient.connect();
  }

  // ✅ Método para establecer el servidor WebSocket
  setWebSocketServer(wss: Server) {
    this.wss = wss;
  }

  async updateStateInvoice(userId: string) {
    try {

      const socketId = await this.redisClient.get(`user:${userId}`);

      if (socketId && this.wss) {
        this.wss.to(socketId).emit('updateStateInvoice');
      } else {
        console.warn(`⚠️ No se pudo enviar el mensaje WebSocket a user:${userId}`);
      }
    } catch (error) {
      console.error('❌ ERROR al actualizar estado de la factura:', error);
    }
  }
}
