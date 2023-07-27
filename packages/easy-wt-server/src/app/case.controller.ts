import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CaseEvent, IScriptCase, RunConfig } from '@easy-wt/common';
import { ScriptCaseService } from '@easy-wt/database-core';
import { CasePoolService } from '@easy-wt/easy-wt-core';
import { WsGateway } from './ws.gateway';

@Controller('case')
export class CaseController {
  logger = new Logger('case-controller');

  constructor(
    private readonly scriptCaseService: ScriptCaseService,
    private ws: WsGateway,
    private readonly casePoolService: CasePoolService
  ) {
    const eventEmitter = casePoolService.eventEmitter;

    eventEmitter.on(CaseEvent.CASE_BEGIN, (data) => {
      this.ws.emit(CaseEvent.CASE_BEGIN, data);
    });
    eventEmitter.on(CaseEvent.CASE_END, (data) => {
      this.ws.emit(CaseEvent.CASE_END, data);
    });
    eventEmitter.on(CaseEvent.STEP_BEGIN, (data) => {
      this.ws.emit(CaseEvent.STEP_BEGIN, data);
    });
    eventEmitter.on(CaseEvent.STEP_END, (data) => {
      this.ws.emit(CaseEvent.STEP_END, data);
    });
    eventEmitter.on(CaseEvent.CASE_QUEUE_ADD, (data) => {
      this.ws.emit(CaseEvent.CASE_QUEUE_ADD, data);
    });
    eventEmitter.on(CaseEvent.CASE_QUEUE_REMOVE, (data) => {
      this.ws.emit(CaseEvent.CASE_QUEUE_REMOVE, data);
    });
  }

  /**
   * 返回全部目录树
   */
  @Get('tree')
  public findTrees() {
    return this.scriptCaseService.findTrees();
  }

  @Get()
  findCaseById(@Query('id', ParseIntPipe) id: number): Promise<IScriptCase> {
    return this.scriptCaseService.findById(id);
  }

  @Get('/root')
  findRoots(): Promise<IScriptCase[]> {
    return this.scriptCaseService.findRoots();
  }

  /**
   * 保存节点
   * @param item
   */
  @Post()
  saveCase(@Body() item: IScriptCase): Promise<IScriptCase> {
    return this.scriptCaseService.save(item);
  }

  @Post('/execute')
  async executeCase(
    @Body('caseId') caseId: Array<number>,
    @Body('config') config: Partial<RunConfig>
  ): Promise<void> {
    await this.casePoolService.executeCase(caseId, config);
  }

  @Get('ancestor/tree/:id')
  findAncestorsTree(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IScriptCase> {
    return this.scriptCaseService.findAncestorsTree(id);
  }

  @Post('copy/:id')
  copyCase(@Param('id', ParseIntPipe) caseId: number): Promise<IScriptCase> {
    return this.scriptCaseService.copyCase(caseId);
  }

  @Delete(':id')
  deleteCase(@Param('id', ParseIntPipe) id: number): Promise<number[]> {
    return this.scriptCaseService.delete(id);
  }

  @Get('/list/:id')
  findCasesById(@Param('id', ParseIntPipe) id: number): Promise<IScriptCase[]> {
    return this.scriptCaseService.findCasesById(id);
  }

  @Get('/descendant/:id')
  findDescendantsById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IScriptCase[]> {
    return this.scriptCaseService.findDescendantsById(id);
  }
}
