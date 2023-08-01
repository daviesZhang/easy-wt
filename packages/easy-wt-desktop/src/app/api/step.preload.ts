import { Expose } from './helper';
import { Step } from '@easy-wt/common';

import { StepService } from '@easy-wt/database-core';
import { INestApplicationContext } from '@nestjs/common';

export class StepExposeService implements Expose {
  private stepService: StepService;

  constructor(applicationContext: INestApplicationContext) {
    this.stepService = applicationContext.get(StepService);
  }

  expose(): { [p: string]: unknown } {
    return {
      findAll: () => this.stepService.findAll(),
      findById: (id: number) => this.stepService.findById(id),
      save: (item: Array<Step>, sort?: boolean) =>
        this.stepService.save(item, sort),
      update: (id: number, item: Step) => this.stepService.update(id, item),
      findByCaseId: (caseId: number) => this.stepService.findByCaseId(caseId),
      delete: (id: Array<number>) => this.stepService.delete(id),
    };
  }
}
