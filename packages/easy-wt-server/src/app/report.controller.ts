import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Inject,
  Logger,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import {
  ENVIRONMENT_CONFIG_TOKEN,
  EnvironmentConfig,
  QueryParams,
  Report,
  StatReport,
} from '@easy-wt/common';
import { ReportService } from '@easy-wt/database-core';
import { ReportHelpService } from '@easy-wt/easy-wt-core';
import { ReportExportService } from '@easy-wt/browser-core';
import path, { join } from 'path';

import * as fs from 'fs-extra';

@Controller('report')
export class ReportController {
  logger = new Logger('report-controller');

  constructor(
    private readonly reportHelpService: ReportHelpService,
    private readonly reportService: ReportService,
    private readonly reportExportService: ReportExportService,
    @Inject(ENVIRONMENT_CONFIG_TOKEN) private configuration: EnvironmentConfig
  ) {}

  @Delete('id')
  deleteReport(
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' }))
    id: Array<number>
  ): Promise<void> {
    return this.reportHelpService.deleteReport(id);
  }

  @Post('page')
  findReportPage(@Body() query: QueryParams): Promise<[Report[], StatReport]> {
    return this.reportService.findPage(query);
  }

  @Get()
  async findReportById(@Query('id', ParseIntPipe) id: number): Promise<Report> {
    const report = await this.reportService.findById(id);
    report.actions.forEach((action) => {
      if (action.data && action.data.screenshot) {
        action.data.screenshot = path.basename(action.data.screenshot);
      }
      if (action.data && action.data.video) {
        //截取目录,视频存储路径是 输出路径+videos/+执行uuid/视频名称
        //截取到 执行uuid/视频名称
        action.data.video = action.data.video.replace(
          /.*?([\w-]+\/[\w-]+\.\w+)$/g,
          '$1'
        );
      }
    });
    return report;
  }

  @Get('/pdf/:id')
  async exportReportPDF(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang = 'zh'
  ): Promise<StreamableFile> {
    const report = await this.reportService.findById(id);
    const html = join(__dirname, 'assets', 'easy-wt-report-web', 'index.html');
    const buffer = await this.reportExportService.exportPDFBuffer(
      `file://${html}#pdf?lang=${lang}`,
      report
    );
    return new StreamableFile(buffer);
  }

  @Get('/html/:id')
  async exportReportHTML(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang = 'zh'
  ): Promise<StreamableFile> {
    const report = await this.reportService.findById(id);
    const src = join(__dirname, 'assets', 'easy-wt-report-web');
    const stream = await this.reportExportService.reportZipStream(
      src,
      report,
      (action) => {
        if (action.data.screenshot) {
          action.data.screenshot = `./images/${path.basename(
            action.data.screenshot
          )}`;
        }
        if (action.data.video) {
          action.data.video = `./videos/${path.basename(action.data.video)}`;
        }
      },
      lang
    );
    return new StreamableFile(stream);
  }

  @Get('/images/:id/:name')
  @Header('Content-Type', 'image/png')
  async showImages(@Param('name') name: string, @Param('id') nanoid: string) {
    if (/^\w+\.(png|jpg)$/.test(name)) {
      this.logger.debug(`请求载入图片[${name}]`);
      const file = fs.createReadStream(
        path.join(this.configuration.output, nanoid, 'images', name)
      );
      return new StreamableFile(file);
    }
    throw new Error('错误的请求~');
  }

  @Get('/videos/:id/:dir/:name')
  async showVideos(
    @Param('name') name: string,
    @Param('id') nanoid: string,
    @Param('dir') dir: string
  ) {
    if (/^[\w-]+\.webm$/.test(name) && /^[\w-]+$/.test(dir)) {
      this.logger.debug(`请求载入视频[${name}]`);
      const file = fs.createReadStream(
        path.join(this.configuration.output, nanoid, 'videos', dir, name)
      );
      return new StreamableFile(file);
    }
    throw new Error('错误的请求~');
  }
}
