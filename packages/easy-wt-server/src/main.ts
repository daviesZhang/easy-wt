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

async function bootstrap() {
  const config = await fs.readJSON(
    environment.production
      ? path.join(__dirname, 'config.json')
      : environment.environmentConfigPath
  );
  const app = await NestFactory.create(AppModule.register(config), {
    logger: new LogService(),
  });
  // app.use(compression());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap().then();
