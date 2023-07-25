import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Observable, Subject, timer} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'easy-wt-refresh-button',
  templateUrl: './refresh-button.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [`
    :host {
      display: inline-flex;
      justify-content: center;
      align-content: center;
      margin-left: 5px;
    }

    button {
            border-radius: 2px 0 0 2px;
        }

        .progress {
            width: 60px;
            border: 1px solid #2F54EB;
            border-left: none;
            height: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding-left: 6px;
            border-radius: 0 2px 2px 0;
        }
    `]
})
export class RefreshButtonComponent implements OnInit {

  refresh = false;


  @Input()
  time = 12;

  @Input()
  refreshFunc!: () => Observable<any>;


  stop$ = new Subject<void>();

  index = 0;


  percent$: Subject<number> = new Subject<number>();

  constructor() {
  }

  ngOnInit(): void {
  }


  onRefresh() {
    if (this.refresh) {
      this.stop$.next();
      this.refresh = false;
      this.index = 0;
    } else {
      this.refresh = true;
      timer(0, 1000).pipe(takeUntil(this.stop$))
        .subscribe(() => {
          this.index = this.index + 1;
          if (this.index <= this.time) {
            this.percent$.next(parseInt((this.index / this.time) * 100 + ''));
          }
          if (this.index === this.time) {
            this.percent$.next(100);
            this.refreshFunc().subscribe(() => {
              this.index = 0;
            });
          }
        });
    }
  }
}
