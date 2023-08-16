import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RunConfig } from '@easy-wt/common';

import { RunConfigEntity } from '../entitys';

@Injectable()
export class RunConfigService {
  constructor(
    @InjectRepository(RunConfigEntity)
    private configRepository: Repository<RunConfig>,
    private dataSource: DataSource
  ) {}
}
