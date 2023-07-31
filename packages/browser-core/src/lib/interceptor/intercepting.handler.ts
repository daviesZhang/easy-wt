import {
  IStep,
  RunContext,
  StepHandler,
  StepInterceptor,
  StepResult,
} from '@easy-wt/common';
import { Observable } from 'rxjs';
import { InterceptorHandler } from './interceptor.handler';

export class InterceptingHandler implements StepHandler {
  interceptors: StepInterceptor[];

  backend: StepHandler;

  constructor(backend: StepHandler, interceptors: StepInterceptor[]) {
    this.backend = backend;
    this.interceptors = interceptors;
  }

  handle(step: IStep, context: RunContext): Observable<StepResult<IStep>> {
    const chain = this.interceptors.reduceRight(
      (next, interceptor) => new InterceptorHandler(next, interceptor),
      this.backend
    );
    return chain.handle(step, context);
  }
}
