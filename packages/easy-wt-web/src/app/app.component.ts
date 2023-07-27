import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'easy-wt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  constructor(private title: Title) {}
}
