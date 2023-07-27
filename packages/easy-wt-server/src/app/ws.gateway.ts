import {
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';

import * as WebSocket from 'ws';

import { CaseEvent } from '@easy-wt/common';

import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: WebSocket.Server;

  logger = new Logger();

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): WsResponse<any> {
    return { event: 'message', data: `success` };
  }

  @SubscribeMessage('ping')
  handlePing(client: any, payload: any): WsResponse<any> {
    return { event: 'ping', data: new Date().getTime() };
  }

  afterInit(server: WebSocket.Server): any {}

  handleConnection(client: WebSocket, ...args: any[]): any {
    this.logger.log('客户端数量:' + this.server.clients.size);
    client.send(JSON.stringify({ event: 'connect', data: 'success' }));
  }

  emit(event: CaseEvent, data: any) {
    this.server.clients.forEach((client) => {
      client.send(JSON.stringify({ event: event, data: data }));
    });
  }

  handleDisconnect(client: any): any {}
}
