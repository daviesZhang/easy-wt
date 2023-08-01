import { Expose, sendLogger } from './helper';
import { ISchedule, QueryParams } from '@easy-wt/common';
import { ScheduleTaskService } from '@easy-wt/easy-wt-core';
import { INestApplicationContext } from '@nestjs/common';

export class ScheduleExposeService implements Expose {
  private scheduleTaskService: ScheduleTaskService;

  constructor(private applicationContext: INestApplicationContext) {
    this.scheduleTaskService = applicationContext.get(ScheduleTaskService);
    this.scheduleTaskService.init().then((next) => {
      sendLogger('info', '初始化定时任务完成~');
    });
  }

  expose(): { [p: string]: unknown } {
    return {
      scheduleExecuteCase: (params: {
        caseId: number;
        name: string;
        cron: string;
        enable?: boolean;
      }) => this.scheduleTaskService.scheduleExecuteCase(params),
      deleteSchedule: (scheduleId: number[]) =>
        this.scheduleTaskService.deleteSchedule(scheduleId),
      saveAndCreate: (schedules: Partial<ISchedule>[]) =>
        this.scheduleTaskService.saveAndCreate(schedules),
      findPage: (query: QueryParams) =>
        this.scheduleTaskService.findPage(query),
      getCronNextDate: (corn: string) =>
        Promise.resolve(this.scheduleTaskService.getCronNextDate(corn)),
    };
  }
}
