import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { RunConfig, Step } from '@easy-wt/common';

import { RunConfigEntity, StepEntity } from '../entitys';

@Injectable()
export class RunConfigService {
  constructor(
    @InjectRepository(RunConfigEntity)
    private configRepository: Repository<RunConfig>,
    private dataSource: DataSource
  ) {}
}
