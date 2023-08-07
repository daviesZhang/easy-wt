/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { LogService } from './log.service';
import * as fs from 'fs-extra';
import path from 'path';
import { environment } from './environments/environment';
import { WsAdapter } from '@nestjs/platform-ws';
import { EnvironmentConfig } from '@easy-wt/common';
import { WsGateway } from './app/ws.gateway';

async function bootstrap() {
  const config: EnvironmentConfig = await fs.readJSON(
    environment.production
      ? path.join(__dirname, 'config.json')
      : environment.environmentConfigPath
  );
  config.output = path.resolve(config.output);
  const app = await NestFactory.create(AppModule.register(config), {
    bufferLogs: true,
  });
  app.useWebSocketAdapter(new WsAdapter(app));
  const ws = app.get(WsGateway);
  app.useLogger(new LogService(ws));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap().then();
