import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleEntity } from '../entitys';
import { DataSource, Like, Repository } from 'typeorm';
import { ISchedule, QueryParams } from '@easy-wt/common';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private repository: Repository<ISchedule>,
    private dataSource: DataSource
  ) {}

  findById(id: number): Promise<ISchedule> {
    return this.repository.findOneBy({
      id: id,
    });
  }

  findAll(query: QueryParams['params']): Promise<ISchedule[]> {
    const params = query || {};
    if (params['name']) {
      params['name'] = Like(`%${params['name']}%`);
    }
    if (params['serviceName']) {
      params['serviceName'] = Like(`%${params['serviceName']}%`);
    }

    return this.repository.find({
      where: params,
    });
  }

  async findPage(query: QueryParams): Promise<[ISchedule[], number]> {
    const params = query.params || {};
    if (params['name']) {
      params['name'] = Like(`%${params['name']}%`);
    }
    if (params['serviceName']) {
      params['serviceName'] = Like(`%${params['serviceName']}%`);
    }
    if (params['caseName']) {
      Object.assign(params, {
        scriptCase: { name: Like(`%${params['caseName']}%`) },
      });
      delete params['caseName'];
    }
    return await this.repository.findAndCount({
      where: params,
      order: query.orderBys,
      take: query.size,
      skip: query.size * (query.current - 1),
      relations: ['scriptCase'],
    });
  }

  async delete(ids: Array<number>): Promise<number> {
    const result = await this.repository.delete(ids);
    return result.affected;
  }

  save(data: Partial<ISchedule>[]): Promise<ISchedule[]> {
    return this.repository.save(data);
  }
}
