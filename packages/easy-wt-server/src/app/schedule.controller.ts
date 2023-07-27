import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  ParseArrayPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ISchedule, QueryParams } from '@easy-wt/common';
import { ReportService, ScriptCaseService } from '@easy-wt/database-core';
import { CasePoolService, ScheduleTaskService } from '@easy-wt/easy-wt-core';

@Controller('schedule')
export class ScheduleController {
  logger = new Logger('schedule-controller');

  constructor(
    private readonly scriptCaseService: ScriptCaseService,
    private readonly reportService: ReportService,
    private readonly scheduleTaskService: ScheduleTaskService,
    private readonly casePoolService: CasePoolService
  ) {}

  @Post('execute/case')
  scheduleExecuteCase(
    @Body()
    params: {
      caseId: number;
      name: string;
      cron: string;
      enable?: boolean;
    }
  ): Promise<void> {
    return this.scheduleTaskService.scheduleExecuteCase(params);
  }

  @Delete('id')
  deleteSchedule(
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' }))
    id: Array<number>
  ): Promise<void> {
    return this.scheduleTaskService.deleteSchedule(id);
  }

  @Post('page')
  findSchedulePage(@Body() query: QueryParams): Promise<[ISchedule[], number]> {
    return this.scheduleTaskService.findPage(query);
  }

  @Post()
  saveAndCreate(@Body() schedules: Partial<ISchedule>[]): Promise<void> {
    return this.scheduleTaskService.saveAndCreate(schedules);
  }

  @Get('/next')
  getCronNextDate(@Query('cron') cron: string): number {
    try {
      return this.scheduleTaskService.getCronNextDate(cron);
    } catch (e) {
      return null;
    }
  }
}
