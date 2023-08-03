import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  Equal,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { IStep, Step } from '@easy-wt/common';

import { StepEntity } from '../entitys';

@Injectable()
export class StepService {
  constructor(
    @InjectRepository(StepEntity)
    private stepRepository: Repository<Step>,
    private dataSource: DataSource
  ) {}

  findAll(): Promise<Step[]> {
    return this.stepRepository.find();
  }

  findById(id: number): Promise<Step> {
    return this.stepRepository.findOneBy({ id: id });
  }

  findByCaseId(caseId: number): Promise<Step[]> {
    return this.stepRepository.findBy({ caseId: caseId });
  }

  async delete(ids: Array<number>): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      for (const id of ids) {
        const step = await manager.findOneBy(StepEntity, { id });
        if (step) {
          const sort = step.sort;
          await manager.delete(StepEntity, id);
          if (typeof sort === 'number') {
            await manager.increment(
              StepEntity,
              { sort: MoreThan(sort) },
              'sort',
              1
            );
          }
        }
      }
    });
  }

  update(id: number, data: Partial<IStep>): Promise<string> {
    return this.stepRepository.update(id, data).then((next) => next.raw);
  }

  /**
   * Save steps.
   * @param data The steps to save.
   * @param sort Whether to sort the steps.
   * @returns The saved steps.
   */
  async save(data: Array<IStep>, sort = true): Promise<IStep[]> {
    if (!sort) {
      return this.stepRepository.save(data);
    }
    const steps: IStep[] = [];
    await this.dataSource.transaction(async (manager) => {
      for (const step of data) {
        const { caseId, id, sort: stepSort } = step;
        if (id === null || id === undefined) {
          step.sort = await this.calculateSort(caseId, stepSort);
        }
        const savedStep = await this.stepRepository.save(step);
        steps.push(savedStep);
        if (stepSort !== null && stepSort !== undefined) {
          await this.incrementSort(caseId, stepSort, savedStep.id, manager);
        }
      }
    });
    return Promise.resolve(steps);
  }

  /**
   * Calculate the sort value for a step.
   * @param caseId The case id.
   * @param stepSort The step sort.
   * @returns The calculated sort value.
   */
  private async calculateSort(
    caseId: number,
    stepSort: number | null | undefined
  ): Promise<number> {
    if (stepSort === null || stepSort === undefined) {
      const maxStep = await this.stepRepository
        .createQueryBuilder('step')
        .select()
        .where('step.caseId = :caseId', { caseId })
        .orderBy('step.sort', 'DESC')
        .limit(1)
        .getOne();
      return maxStep ? maxStep.sort + 1 : 0;
    }
    return stepSort;
  }

  /**
   * Increment the sort values of steps greater than or equal to the given sort value.
   * @param caseId The case id.
   * @param stepSort The step sort.
   * @param stepId The step id.
   * @param manager The transaction manager.
   */
  private async incrementSort(
    caseId: number,
    stepSort: number,
    stepId: number,
    manager: EntityManager
  ): Promise<void> {
    await manager.increment(
      StepEntity,
      {
        sort: MoreThanOrEqual(stepSort),
        id: Not(Equal(stepId)),
        caseId: caseId,
      },
      'sort',
      1
    );
  }
}
