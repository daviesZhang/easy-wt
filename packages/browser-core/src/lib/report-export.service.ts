import { Injectable } from '@nestjs/common';

import { ActionResult, IStep, Report } from '@easy-wt/common';

import * as path from 'path';
import * as fs from 'fs-extra';
import * as compressing from 'compressing';
import { chromium } from 'playwright';
import { firstValueFrom, fromEvent } from 'rxjs';

@Injectable()
export class ReportExportService {
  /**
   * 导出网页报告作为PDF的方法
   * 调用puppeteer打开url然后通过api导出pdf
   * @param url 报告url
   * @param report 报告数据
   * @param browserPath 浏览器地址,利用浏览器的页面导出pdf功能
   * @param savePath
   */
  async exportPDF(
    url: string,
    report: Report,
    browserPath: string,
    savePath: string
  ): Promise<string> {
    const { browser, page } = await this.getPage(report, url, browserPath);
    const reportPath = path.dirname(savePath);
    const reportName = path.basename(savePath);
    const reportPathExists = await fs.pathExists(reportPath);
    if (!reportPathExists) {
      await fs.ensureDir(reportPath);
    }
    const filePath = path.join(reportPath, reportName);
    await page.emulateMedia({ media: 'screen' });
    await page.pdf({
      path: path.join(reportPath, reportName),
      printBackground: true,
      format: 'Letter',
    });
    await browser.close();
    return filePath;
  }

  async exportPDFBuffer(url: string, report: Report): Promise<Buffer> {
    const { browser, page } = await this.getPage(report, url);
    await page.emulateMedia({ media: 'screen' });
    return page
      .pdf({ printBackground: true, format: 'Letter' })
      .then(async (b) => {
        await browser.close();
        return b;
      });
  }

  /**
   *
   * @param reportSource 报告所在源文件路径
   * @param report 报告数据
   * @param handler 拷贝依赖资源时回调方法
   * @param lang 报告语言
   */
  async reportZipStream(
    reportSource: string,
    report: Report,
    handler?: (action: ActionResult<IStep>, dest: string) => void,
    lang = 'zh'
  ) {
    const tarStream = new compressing.zip.Stream();
    await this.addEntry(reportSource, tarStream);

    for (const action of report.actions) {
      if (!action.data) {
        continue;
      }
      if (action.data.screenshot) {
        const image = action.data.screenshot;
        if (!(await fs.pathExists(image))) {
          continue;
        }
        const dest = path.join('images', path.basename(image));
        tarStream.addEntry(image, { relativePath: dest });
        if (handler) {
          handler(action, dest);
        }
      }
      if (action.data.video) {
        const video = action.data.video;
        if (!(await fs.pathExists(video))) {
          continue;
        }
        const dest = path.join('videos', path.basename(video));
        tarStream.addEntry(video, { relativePath: dest });
        if (handler) {
          handler(action, dest);
        }
      }
    }
    let langFile = path.join(reportSource, 'assets', 'i18n', `${lang}.json`);
    if (!(await fs.pathExists(langFile))) {
      langFile = path.join(reportSource, 'assets', 'i18n', `zh.json`);
    }
    const langBuffer = await fs.readFile(langFile);
    tarStream.addEntry(Buffer.concat([Buffer.from('var lang='), langBuffer]), {
      relativePath: path.join('assets', 'i18n', 'lang.json'),
    });
    tarStream.addEntry(
      Buffer.from(`window.reportData=${JSON.stringify(report)}`),
      {
        relativePath: 'report.js',
      }
    );

    function handleError(err: Error) {
      if (!tarStream.closed) {
        tarStream.close();
      }
    }

    return tarStream.on('error', handleError);
  }

  async reportZip(
    reportSource: string,
    dist: string,
    report: Report,
    handler?: (action: ActionResult<IStep>, dest: string) => void,
    lang = 'zh'
  ) {
    const zipStream = await this.reportZipStream(
      reportSource,
      report,
      handler,
      lang
    );
    const zipWriteStream = fs.createWriteStream(dist);

    function handleError(err: Error) {
      if (!zipWriteStream.closed) {
        zipWriteStream.close();
      }
    }

    const stream = zipStream.pipe(zipWriteStream).on('error', handleError);
    return firstValueFrom(fromEvent(stream, 'finish'));
  }

  private async addEntry(dir: string, tarStream: compressing.zip.Stream) {
    const list = await fs.readdir(dir);
    const files = list.filter((file) => !file.startsWith('i18n'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        tarStream.addEntry(filePath, { relativePath: file });
      }
      if (stat.isDirectory()) {
        await this.addEntry(filePath, tarStream);
      }
    }
  }

  /**
   * 已无头模式启动浏览器打开报告页面,等待页面加载完成
   * @param report
   * @param browserPath
   * @param url
   * @private
   */
  private async getPage(report: Report, url: string, browserPath?: string) {
    const config = {};
    if (browserPath) {
      Object.assign(config, { executablePath: browserPath });
    }
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-web-security',
        '--allow-file-access-from-files',
        '--allow-external-pages',
        '--enable-local-file-accesses',
      ],
      ...config,
    });
    try {
      const page = await browser.newPage();
      await page.goto(url);
      await page.$eval(
        'body',
        (element, report: string) => {
          element.className = `${element.className} print`;
          Object.assign(window, { reportData: JSON.parse(report) });
        },
        JSON.stringify(report)
      );
      await page.waitForSelector('.grid-table', { timeout: 3000 });
      return { browser, page };
    } catch (err) {
      if (browser.isConnected()) {
        await browser.close();
      }
      throw err;
    }
  }
}
