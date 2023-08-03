import { Logger as TypeOrmLogger } from 'typeorm';
import { Logger as NestLogger } from '@nestjs/common';

export class DatabaseLogger implements TypeOrmLogger {
  private readonly logger = new NestLogger('SQL');

  production = true;

  constructor(production = true) {
    this.production = production;
  }

  logQuery(query: string, parameters?: unknown[]) {
    if (!this.production) {
      this.logger.log(
        `${query} -- Parameters: ${this.stringifyParameters(parameters)}`
      );
    }
  }

  logQueryError(error: string, query: string, parameters?: unknown[]) {
    this.logger.error(
      `${query} -- Parameters: ${this.stringifyParameters(
        parameters
      )} -- ${error}`
    );
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[]) {
    this.logger.warn(
      `Time: ${time} -- Parameters: ${this.stringifyParameters(
        parameters
      )} -- ${query}`
    );
  }

  logMigration(message: string) {
    if (!this.production) {
      this.logger.log(message);
    }
  }

  logSchemaBuild(message: string) {
    if (!this.production) {
      this.logger.log(message);
    }
  }

  log(level: 'log' | 'info' | 'warn', message: string) {
    if (level === 'log') {
      return this.logger.log(message);
    }
    if (level === 'info') {
      return this.logger.debug(message);
    }
    if (level === 'warn') {
      return this.logger.warn(message);
    }
  }

  private stringifyParameters(parameters?: unknown[]) {
    try {
      return JSON.stringify(parameters);
    } catch {
      return '';
    }
  }
}

export default DatabaseLogger;
