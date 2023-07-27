import { ScriptCaseService } from '@easy-wt/database-core';
import { IScriptCase, ScriptCase } from '@easy-wt/common';
import * as compressing from 'compressing';
import {
  fromEvent,
  lastValueFrom,
  merge,
  reduce,
  switchMap,
  takeUntil,
} from 'rxjs';
import { Expose, sendLogger } from './expose';

const RELATIVE_PATH = 'scriptCase.json';

export class ExposeCaseService implements Expose {
  constructor(private caseService: ScriptCaseService) {}

  expose() {
    return {
      findAll: () => this.caseService.findAll(),
      findById: (id: number) => this.caseService.findById(id),
      save: (item: ScriptCase) => this.caseService.save(item),
      update: (id: number, item: ScriptCase) =>
        this.caseService.update(id, item),
      findCasesById: (categoryId: number) =>
        this.caseService.findCasesById(categoryId),
      findDescendantsById: (categoryId: number) =>
        this.caseService.findDescendantsById(categoryId),
      findTrees: () => this.caseService.findTrees(),
      copyCase: (id: number) => this.caseService.copyCase(id),
      findRoots: () => this.caseService.findRoots(),
      findAncestorsTree: (id: number) => this.caseService.findAncestorsTree(id),
      delete: (id: number): Promise<number[]> => this.caseService.delete(id),
      exportCase: this.exportCase.bind(this),
      importCase: this.importCase.bind(this),
    };
  }

  private replacer(key: string, value: unknown) {
    if (key === 'id' || key === 'caseId' || key === 'parentId') {
      return null;
    }
    return value;
  }

  private async importCase(id: number | null, filePath: string) {
    let scriptCase: IScriptCase;
    try {
      const stream = new compressing.gzip.UncompressStream({
        source: filePath,
      });
      const end$ = fromEvent(stream, 'end');
      const error$ = fromEvent(stream, 'error').pipe(
        switchMap((err: Error) => {
          sendLogger('error', `导入文件错误,${err.message}`);
          return new Promise((resolve, reject) => {
            if (stream.closed) {
              resolve(true);
            } else {
              stream.close(() => resolve(true));
            }
          });
        })
      );

      const buffer = await lastValueFrom(
        fromEvent(stream, 'data').pipe(
          takeUntil(merge(end$, error$)),
          reduce((acc, value) =>
            Buffer.concat([acc as Buffer, value as Buffer])
          )
        )
      );
      const json = (buffer as Buffer).toString('utf-8');
      scriptCase = JSON.parse(json) as IScriptCase;
    } catch (e) {
      sendLogger('error', `导入文件错误,${e.message}`);
      return Promise.reject(new Error('case.import.file_error'));
    }
    try {
      return await this.caseService.saveTree(scriptCase, id);
    } catch (e) {
      sendLogger('error', `导入文件保存时错误,${e.message}`);
      return Promise.reject(new Error('case.import.file_error'));
    }
  }

  private async exportCase(id: number, savePath: string, parentTree: boolean) {
    const parent = await this.caseService.findAncestorsTree(id);
    const scriptCase = await this.caseService.findDescendantTreeById(id);
    parent.children = scriptCase.children;
    if (!parentTree) {
      parent.parent = null;
      parent.parentId = null;
    }
    const buffer = Buffer.from(JSON.stringify(parent, this.replacer));
    await compressing.gzip.compressFile(buffer, savePath);
  }
}
