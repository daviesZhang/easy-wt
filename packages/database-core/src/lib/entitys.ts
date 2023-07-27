import {
  ActionResult,
  ISchedule,
  IScriptCase,
  IStep,
  Report,
  RunConfig,
  Selector,
  StepType,
  SupportBrowserType,
} from '@easy-wt/common';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';

class EmptyStringToNullTransformer implements ValueTransformer {
  from(value: any): any {
    return value;
  }

  to(value: any): any {
    if (typeof value === 'string' && !value) {
      return null;
    }
    return value;
  }
}

const emptyStringToNullTransformer = new EmptyStringToNullTransformer();

@Entity({ name: 'script_case' })
@Tree('closure-table')
export class ScriptCaseEntity implements IScriptCase {
  @PrimaryGeneratedColumn()
  id: number;

  @TreeChildren({ cascade: ['remove'] })
  children: ScriptCaseEntity[];

  @Column({ update: false })
  directory: boolean;

  @Column()
  name: string;

  @TreeParent({ onDelete: 'CASCADE' })
  parent: ScriptCaseEntity;

  @Column('int', { nullable: true })
  parentId: number;

  @OneToMany(() => StepEntity, (step) => step.scriptCase)
  steps: IStep[];

  @OneToOne(() => RunConfigEntity, (step) => step.scriptCase, { cascade: true })
  runConfig: RunConfig;
}

@Entity({ name: 'case_run_config' })
export class RunConfigEntity implements RunConfig {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  caseId: number;

  @Column({ nullable: true, transformer: emptyStringToNullTransformer })
  retry: number;

  @Column({ nullable: true, transformer: emptyStringToNullTransformer })
  stepRetry: number;

  @Column({ nullable: true })
  delay: number;

  @Column({ nullable: true, type: 'simple-json' })
  runParams: Record<string, unknown>;

  @Column({ nullable: true, type: 'simple-json' })
  browserType: Array<SupportBrowserType>;

  @OneToOne(() => ScriptCaseEntity, (scriptCase) => scriptCase.runConfig, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caseId' })
  scriptCase: IScriptCase;
}

@Entity({ name: 'case_step' })
export class StepEntity implements IStep {
  @Column()
  caseId: number;
  @Column({ nullable: true })
  desc: string;
  @Column({ type: 'text', nullable: true })
  expression: string;

  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  name: string;
  @Column('simple-json', { nullable: true })
  options: unknown;
  @ManyToOne(() => ScriptCaseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  scriptCase: IScriptCase;
  @Column('simple-json', { nullable: true })
  selector: Selector;
  @Column({ nullable: true })
  sort: number;
  @Column('varchar', { nullable: true })
  type: StepType;

  @Column({ nullable: true, default: true })
  enable: boolean;
}

@Entity({ name: 'case_report' })
export class ReportEntity implements Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  caseId: number;

  @Column('simple-json', { nullable: true, select: false })
  actions: Array<ActionResult<IStep>>;

  @Column()
  success: boolean;
  @Column()
  runCount: number;

  @Column()
  casePath: string;
  @Column()
  name: string;

  @Column()
  browserType: string;

  @Column()
  outputPath: string;

  @Column()
  totalCheck: number;
  @Column()
  successCount: number;

  @Column({ type: 'varchar' })
  beginTime: number;

  @Column({ type: 'varchar' })
  endTime: number;
}

@Entity({ name: 'case_schedule' })
export class ScheduleEntity implements ISchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cron: string;

  @Column()
  functionName: string;

  @Column('simple-json', { nullable: true })
  params: Array<unknown>;

  @Column()
  serviceName: string;

  @Column()
  name: string;

  @Column()
  enable: boolean;

  @ManyToOne(() => ScriptCaseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  scriptCase: IScriptCase;

  @Column({ type: 'varchar', nullable: true })
  lastDate: number;
}
