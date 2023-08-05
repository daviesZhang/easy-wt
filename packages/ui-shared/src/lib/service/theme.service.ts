import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, map, Observable } from 'rxjs';

const THEME_KEY = 'theme';

export enum ThemeType {
  dark = 'dark',
  default = 'default',
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  currentTheme$: Observable<ThemeType>;

  currentGridTheme$: Observable<string>;

  private _currentTheme$: BehaviorSubject<ThemeType>;

  constructor(@Inject(DOCUMENT) private _doc: Document) {
    const currentTheme =
      (localStorage.getItem(THEME_KEY) as ThemeType) || ThemeType.default;
    this._currentTheme$ = new BehaviorSubject<ThemeType>(currentTheme);
    this.currentTheme$ = this._currentTheme$.asObservable();
    this.currentGridTheme$ = this.currentTheme$.pipe(
      map((next) =>
        next === 'dark' ? 'ag-theme-balham-dark' : 'ag-theme-balham'
      )
    );
  }

  public loadTheme(firstLoad = true): Promise<Event> {
    const theme = this._currentTheme$.value;
    if (firstLoad) {
      this._doc.documentElement.classList.add(theme);
    }
    return new Promise<Event>((resolve, reject) => {
      this.loadCss(`${theme}.css`, theme).then(
        (e) => {
          if (!firstLoad) {
            this._doc.documentElement.classList.add(theme);
          }
          this.removeUnusedTheme(this.reverseTheme(theme));
          resolve(e);
        },
        (e) => reject(e)
      );
    });
  }

  public currentTheme() {
    return this._currentTheme$.value;
  }
  public async toggleTheme(): Promise<void> {
    this._currentTheme$.next(this.reverseTheme(this._currentTheme$.value));
    await this.loadTheme(false);
    localStorage.setItem(THEME_KEY, this._currentTheme$.value);
  }

  private reverseTheme(theme: string): ThemeType {
    return theme === ThemeType.dark ? ThemeType.default : ThemeType.dark;
  }

  private removeUnusedTheme(theme: ThemeType): void {
    this._doc.documentElement.classList.remove(theme);
    const removedThemeStyle = this._doc.getElementById(theme);
    if (removedThemeStyle) {
      this._doc.head.removeChild(removedThemeStyle);
    }
  }

  private loadCss(href: string, id: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      const style = this._doc.createElement('link');
      style.rel = 'stylesheet';
      style.href = href;
      style.id = id;
      style.onload = resolve;
      style.onerror = reject;
      this._doc.head.append(style);
    });
  }
}
