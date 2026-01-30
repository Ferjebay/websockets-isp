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
      const socketIds = await this.redisClient.sMembers(`user:${userId}`);

      if (socketIds?.length > 0) {
        for (const socketId of socketIds) {
          this.wss.to(socketId).emit('updateStateInvoice');
        }
      } else {
        console.warn(`⚠️ No se pudo enviar el mensaje WebSocket a user:${userId}`);
      }
    } catch (error) {
      console.error('❌ ERROR al actualizar estado de la factura:', error);
    }
  }

  async enviarNotificacion(userId: string, tipo: string, info: any) {
    try {
      const socketIds = await this.redisClient.sMembers(`user:${userId}`);

      if (socketIds?.length > 0) {
        for (const socketId of socketIds) {
          this.wss.to(socketId).emit('notificacion', { tipo, ...info });
        }
      } else {
        console.warn(`⚠️ No se pudo enviar el mensaje WebSocket a user:${userId}`);
      }
    } catch (error) {
      console.error('❌ ERROR al actualizar estado de la factura:', error);
    }
  }

  async enviarNotificacionGlobal(tipo: string, info: any) {
    try {
      if (!this.wss) {
        console.warn('⚠️ WebSocket server no inicializado');
        return;
      }

      this.wss.emit('notificacion', {
        tipo,
        ...info
      });

    } catch (error) {
      console.error('❌ ERROR al enviar notificación global:', error);
    }
  }


}
