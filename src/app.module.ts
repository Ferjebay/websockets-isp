import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { CommonModule } from './common/common.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';
import { ScheduleModule } from '@nestjs/schedule';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot(),

    CacheModule.register({
      store: redisStore,
      host: '127.0.0.1',
      port: 6379,
      isGlobal: true, // Hacer disponible en toda la app
      ttl: 0, // Tiempo de vida en segundos
    }),

    ScheduleModule.forRoot(),

    CommonModule,
    MessagesWsModule,
  ],
  exports: [ AppService ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
