import { DataSourceInfo, EnvironmentConfig } from '@easy-wt/common';
import path from 'path';
import * as process from 'process';

export default ((): EnvironmentConfig => {
  let data: string | DataSourceInfo;
  const databaseType = process.env.database_type || 'sqlite';
  if (databaseType) {
    data = {
      database: process.env.database_name,
      host: process.env.database_host || 'localhost',
      port: parseInt(process.env.database_port, 10) || 3306,
      username: process.env.database_username,
      password: process.env.database_password,
    };
  } else {
    data = process.env.sqlite_file;
  }
  return {
    dbconfig: {
      type: databaseType,
      data,
    },
    output: process.env.output || path.join(__dirname, 'output'),
  } as EnvironmentConfig;
})();
