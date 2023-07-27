import { Pipe, PipeTransform } from '@angular/core';
import { NgxGridTableTranslateService } from './ngx-grid-table-translate.service';

/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
 */
@Pipe({ name: 'gridTableI18n' })
export class GridTableI18nPipe implements PipeTransform {
  constructor(private gridTableService: NgxGridTableTranslateService) {}

  /**
   *
   * @param key
   * @param value
   * @param defaultText
   */
  transform(
    key: string,
    value?: { [key: string]: any },
    defaultText?: string
  ): string {
    return this.gridTableService.translate(key, value);
  }
}
