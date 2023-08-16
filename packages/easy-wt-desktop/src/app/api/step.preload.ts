import { Expose } from './helper';

import { StepService } from '@easy-wt/database-core';
import { INestApplicationContext } from '@nestjs/common';
import { IStep } from '@easy-wt/common';

export class StepExposeService implements Expose {
  private stepService: StepService;

  constructor(applicationContext: INestApplicationContext) {
    this.stepService = applicationContext.get(StepService);
  }

  expose(): { [p: string]: unknown } {
    return {
      findAll: () => this.stepService.findAll(),
      findById: (id: number) => this.stepService.findById(id),
      save: (item: Array<IStep>, sort?: boolean) =>
        this.stepService.save(item, sort),
      update: (id: number, item: IStep) => this.stepService.update(id, item),
      findByCaseId: (caseId: number) => this.stepService.findByCaseId(caseId),
      delete: (id: Array<number>) => this.stepService.delete(id),
    };
  }
}
