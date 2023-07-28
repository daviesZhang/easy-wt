import { Component, Inject, OnInit } from '@angular/core';
import { map, of, retry } from 'rxjs';

import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'easy-wt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = '测试报告';

  reportData$;

  forPDF = false;

  constructor(@Inject(DOCUMENT) private _doc: Document) {
    this.forPDF = _doc.location.hash.indexOf('pdf') >= 0;
  }

  getWindow(): Window | null {
    return this._doc.defaultView;
  }

  getReportData() {
    const data = this.getWindow()['reportData'];
    if (data) {
      return data;
    }
    throw new Error('报告数据缺失~');
  }

  ngOnInit(): void {
    this.reportData$ = of(true).pipe(
      map(() => this.getReportData()),
      retry({ count: 20, delay: 1000 })
    );
  }
}
