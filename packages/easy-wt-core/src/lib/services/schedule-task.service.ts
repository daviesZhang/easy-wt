import { CronJob, CronTime } from 'cron';
import { Injectable, Logger } from '@nestjs/common';
import { ScheduleService } from '@easy-wt/database-core';
import { ModuleRef } from '@nestjs/core';
import { ISchedule, QueryParams } from '@easy-wt/common';

@Injectable()
export class ScheduleTaskService {
  cacheJob = new Map<number, CronJob>();

  logger = new Logger();

  constructor(
    private scheduleService: ScheduleService,
    private moduleRef: ModuleRef
  ) {}

  async init() {
    const list = await this.scheduleService.findAll({ enable: true });
    for (const item of list) {
      await this.create(item);
    }
  }

  async deleteSchedule(scheduleId: number[]) {
    await this.scheduleService.delete(scheduleId);
    for (const id of scheduleId) {
      if (this.cacheJob.has(id)) {
        this.cacheJob.get(id).stop();
        this.cacheJob.delete(id);
      }
    }
  }

  /**
   *
   * @param params
   */
  scheduleExecuteCase(params: {
    caseId: number;
    name: string;
    cron: string;
    enable?: boolean;
  }) {
    const { caseId, cron, enable, name } = params;
    const schedules = {
      scriptCase: { id: caseId },
      name: name,
      serviceName: 'CasePoolService',
      functionName: 'executeCase',
      params: [caseId, {}],
      enable: enable || true,
      cron,
    } as Partial<ISchedule>;
    return this.saveAndCreate([schedules]);
  }

  async saveAndCreate(schedules: Partial<ISchedule>[]) {
    for (const schedule of schedules) {
      if (typeof schedule.id === 'number') {
        const job = this.cacheJob.get(schedule.id);
        if (job) {
          job.stop();
          this.cacheJob.delete(schedule.id);
        }
      }
    }
    const saved = await this.scheduleService.save(schedules);
    for (const item of saved) {
      await this.create(await this.scheduleService.findById(item.id));
    }
  }

  async create(schedule: ISchedule) {
    if (!schedule.enable) {
      return;
    }
    try {
      const service = this.moduleRef.get(schedule.serviceName);
      const cron = new CronJob(
        schedule.cron,
        () => {
          this.logger.debug(`开始执行定时任务${schedule.name}~`);
          this.scheduleService.save([
            { id: schedule.id, lastDate: new Date().getTime() },
          ]);
          service[schedule.functionName](...schedule.params);
        },
        () => {
          this.cacheJob.delete(schedule.id);
        },
        true
      );
      this.cacheJob.set(schedule.id, cron);
      this.logger.debug(`定时任务[${schedule.name}]创建成功~`);
    } catch (e) {
      this.logger.error(`[${schedule.name}]创建定时任务失败~`, e);
    }
  }

  async findPage(query: QueryParams): Promise<[ISchedule[], number]> {
    const [items, count] = await this.scheduleService.findPage(query);
    if (count) {
      items.forEach((item) => {
        if (!item.nextDate && item.enable) {
          item.nextDate = this.getCronNextDate(item.cron);
        }
      });
    }

    return [items, count];
  }

  /**
   * 获得下次运行时间,为空意味着表达式不合格
   * @param corn
   */
  getCronNextDate(corn: string): number | null {
    try {
      return new CronTime(corn).sendAt().toMillis();
    } catch (err) {
      return null;
    }
  }
}
