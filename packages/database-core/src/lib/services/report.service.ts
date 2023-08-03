import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Like, Repository } from 'typeorm';
import { QueryParams, Report, StatReport } from '@easy-wt/common';

import { ReportEntity } from '../entitys';

@Injectable()
export class ReportService {
  private log = new Logger('报告服务');
  constructor(
    @InjectRepository(ReportEntity)
    private reportRepository: Repository<Report>,
    private dataSource: DataSource
  ) {}

  async findPage(query: QueryParams): Promise<[Report[], StatReport]> {
    const params = query.params || {};

    if (params['beginTime']) {
      const time = params['beginTime'] as Array<string>;
      params['beginTime'] = Between(time[0], time[1]);
    }
    if (params['casePath']) {
      params['casePath'] = Like(`%${params['casePath']}%`);
    }
    if (params['name']) {
      params['name'] = Like(`%${params['name']}%`);
    }
    if (params['browserType']) {
      params['browserType'] = In([].concat(params['browserType']));
    }
    let reports: Report[] = [];
    const statReport: StatReport = await this.reportRepository
      .createQueryBuilder('report')
      .select('SUM(report.totalCheck)', 'totalCheck')
      .addSelect('SUM(report.successCount)', 'totalSuccessCheck')
      .addSelect(
        'count(case when report.success then 1 else null end)',
        'success'
      )
      .addSelect('count(1)', 'count')
      .where(params)
      .getRawOne();
    if (typeof statReport.count === 'string') {
      //fix mysql
      Object.keys(statReport).forEach((key) => {
        let value = statReport[key as keyof StatReport] as
          | string
          | number
          | null;
        if (value !== null) {
          value = value.toString();
          Object.assign(statReport, { [key]: parseInt(value) });
        }
      });
    }
    if (statReport.count) {
      reports = await this.reportRepository.find({
        where: params,
        order: query.orderBys,
        take: query.size,
        skip: query.size * (query.current - 1),
      });
    }
    return [reports, statReport];
  }

  getCols<T>(repository: Repository<T>): (keyof T)[] {
    return repository.metadata.columns.map(
      (col) => col.propertyName
    ) as (keyof T)[];
  }

  findById(id: number): Promise<Report> {
    return this.reportRepository.findOne({
      where: { id: id },
      select: this.getCols(this.reportRepository),
    });
  }

  async delete(ids: Array<number>): Promise<void> {
    return this.reportRepository.delete(ids).then();
  }

  async save(data: Report[]): Promise<Report[]> {
    const report = await this.reportRepository.save(data);
    report.forEach((item) => {
      this.log.log(`用例 [${item.name}] 报告保存成功~`);
    });

    return report;
  }
}
