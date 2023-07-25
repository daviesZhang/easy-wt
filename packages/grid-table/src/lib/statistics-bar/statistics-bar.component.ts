import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ColumnApi, GridApi} from "ag-grid-community";
import {Statistics} from '../api';

@Component({
  selector: 'easy-wt-statistics-bar',
  templateUrl: './statistics-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./statistics-bar.component.less']
})
export class StatisticsBarComponent implements OnInit {

  @Input()
  statistics: Array<Statistics> = [];


  @Input()
  subtotal: false | Array<string> = false;

  @Input()
  api!: GridApi;

  @Input()
  columnApi!: ColumnApi;


  constructor() {
  }

  ngOnInit() {
  }

}

