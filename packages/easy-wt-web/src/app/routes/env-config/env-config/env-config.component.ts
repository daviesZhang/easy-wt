import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnvironmentConfig } from '@easy-wt/common';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'easy-wt-env-config',
  templateUrl: './env-config.component.html',
  styleUrls: ['./env-config.component.less'],
})
export class EnvConfigComponent implements OnInit {
  defaultValue: Partial<EnvironmentConfig>;
  show = true;

  constructor(private router: Router, private message: NzMessageService) {}

  async onClose(result: EnvironmentConfig) {
    this.show = false;
    if (result) {
      if (window.electron && window.electron.reload) {
        const messageId = this.message.loading('正在连接数据库...', {
          nzDuration: 0,
        }).messageId;
        try {
          await window.electron.startService(result);
          this.message.remove(messageId);
          this.message.success('数据库连接成功,正在进入应用....');
          setTimeout(() => this.router.navigateByUrl('/').then(), 1000);
        } catch (err) {
          this.message.remove(messageId);
          this.message.error('数据库连接出现问题,请检查配置~');
          setTimeout(() => (this.show = true), 0);
        }
      }
    }
  }

  async getDefaultPath(): Promise<Partial<EnvironmentConfig>> {
    const userData = await window.electron.getPath('userData');
    return {
      output: window.electron.path()['join'](userData, 'output'),
      dbconfig: {
        type: 'sqlite',
        data: window.electron.path()['join'](userData, 'db.sql'),
      },
    };
  }

  ngOnInit(): void {
    this.getDefaultPath().then((config) => (this.defaultValue = config));
  }
}
