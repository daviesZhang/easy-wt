import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CoreService } from '../../core/core.service';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { CaseBeginEvent, CaseEvent, CaseQueue, Report } from '@easy-wt/common';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { map, merge } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'easy-wt-case-progress',
  standalone: true,
  imports: [
    CommonModule,
    NzListModule,
    NzButtonModule,
    NzPopoverModule,
    NzTagModule,
    NzIconModule,
    NgOptimizedImage,
    TranslateModule,
  ],
  templateUrl: './case-progress.component.html',
  styleUrls: ['./case-progress.component.scss'],
})
export class CaseProgressComponent implements OnInit {
  queue: CaseQueue[] = [];

  running = {};

  constructor(private core: CoreService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.core
      .eventObservable(CaseEvent.CASE_BEGIN)
      .subscribe((next: CaseBeginEvent) => {
        this.running = Object.assign(
          { [next.runConfig.uuid]: true },
          this.running
        );
        this.cdr.detectChanges();
      });
    const caseEnd = this.core
      .eventObservable<Report>(CaseEvent.CASE_END)
      .pipe(map((report) => report.uuid));
    const caseErr = this.core
      .eventObservable<{ uuid: string }>(CaseEvent.CASE_ERROR)
      .pipe(map(({ uuid }) => uuid));

    merge(caseEnd, caseErr).subscribe((caseId) => {
      delete this.running[caseId];
      this.cdr.detectChanges();
    });

    this.core
      .eventObservable(CaseEvent.CASE_QUEUE_ADD)
      .subscribe((next: CaseQueue) => {
        this.queue.push(next);
      });
    this.core
      .eventObservable(CaseEvent.CASE_QUEUE_REMOVE)
      .subscribe((next: CaseQueue) => {
        this.queue = this.queue.filter((item) => item.uuid !== next.uuid);
        this.cdr.detectChanges();
      });
  }
}
