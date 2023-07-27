import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UISharedModule } from './ui-shared.module';
import { QueryParams } from '@easy-wt/common';
import { NgxGridTableTranslateService } from './grid-table/ngx-grid-table-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { GridTableConfig } from './grid-table/ngx-grid-table-config';
import { GridTableModule } from './grid-table/grid-table.module';
import { RequestDataParams } from './grid-table/api';

class TranslateGrid {
  constructor(private translateService: TranslateService) {}

  translate(
    key: string,
    value?: { [key: string]: any },
    defaultText?: string
  ): string {
    const text = this.translateService.instant(`grid.${key}`, value);
    if (text === null) {
      return defaultText;
    }
    return text;
  }
}

export const config: GridTableConfig = {
  dataParams: (params: RequestDataParams): QueryParams => {
    const { current, size, orderBys, ...other } = params;
    const queryParams = Object.assign({}, other);
    Object.entries(queryParams).forEach((item) => {
      const [key, value] = item;
      if (
        value === '' ||
        value === undefined ||
        value === null ||
        (Array.isArray(value) && !value.length)
      ) {
        delete queryParams[key];
      }
    });
    return { current, size, orderBys, params: queryParams };
  },
};

@NgModule({
  declarations: [],
  imports: [CommonModule, UISharedModule, GridTableModule.forRoot(config)],
  providers: [
    {
      provide: NgxGridTableTranslateService,
      useFactory: (translateService: TranslateService) =>
        new TranslateGrid(translateService),
      deps: [TranslateService],
    },
  ],
  exports: [GridTableModule],
})
export class NgxGridTableModule {}
