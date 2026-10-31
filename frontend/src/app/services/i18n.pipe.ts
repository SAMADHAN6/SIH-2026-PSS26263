import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';

/**
 * Usage: {{ 'nav.home' | i18n }}
 * Impure pipe so it re-evaluates when the language signal changes.
 */
@Pipe({ name: 'i18n', standalone: true, pure: false })
export class I18nPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(key: string): string {
    return this.i18n.t(key);
  }
}
