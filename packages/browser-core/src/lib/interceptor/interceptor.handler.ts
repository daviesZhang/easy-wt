import {
  IStep,
  RunContext,
  StepHandler,
  StepInterceptor,
} from '@easy-wt/common';

export class InterceptorHandler implements StepHandler {
  next: StepHandler;
  interceptor: StepInterceptor;

  constructor(next: StepHandler, interceptor: StepInterceptor) {
    this.next = next;
    this.interceptor = interceptor;
  }

  handle(step: IStep, context: RunContext) {
    return this.interceptor.intercept(step, context, this.next);
  }
}
