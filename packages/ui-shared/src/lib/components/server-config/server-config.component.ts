import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'easy-wt-server-config',
  templateUrl: './server-config.component.html',
  styleUrls: ['./server-config.component.less'],
})
export class ServerConfigComponent implements OnInit {
  formGroup: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      serverURL: [],
      enabled: [false],
    });
  }

  ngOnInit(): void {}
}
