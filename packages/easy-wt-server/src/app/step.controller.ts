import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { IStep } from '@easy-wt/common';
import { ScriptCaseService, StepService } from '@easy-wt/database-core';
import { CasePoolService } from '@easy-wt/easy-wt-core';

@Controller('step')
export class StepController {
  logger = new Logger('step-controller');

  constructor(
    private readonly scriptCaseService: ScriptCaseService,
    private readonly stepService: StepService,
    private readonly casePoolService: CasePoolService
  ) {}

  @Delete('id')
  deleteStep(@Query('id') id: string): Promise<void> {
    return this.stepService.delete(id.split(',').map((v) => parseInt(v, 10)));
  }

  @Get('/case/:caseId')
  findStepByCaseId(@Param('caseId') caseId: number): Promise<IStep[]> {
    return this.stepService.findByCaseId(caseId);
  }

  @Post()
  saveStep(
    @Body('item') item: IStep[],
    @Body('sort') sort?: boolean
  ): Promise<IStep[]> {
    return this.stepService.save(item, sort);
  }

  @Put()
  updateStep(
    @Body('id') id: number,
    @Body('step') step: Partial<IStep>
  ): Promise<string> {
    return this.stepService.update(id, step);
  }
}
