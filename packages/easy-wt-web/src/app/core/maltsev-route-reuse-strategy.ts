import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from '@angular/router';

@Injectable()
export class MaltsevRouteReuseStrategy implements RouteReuseStrategy {
  private routeCache = new Map<string, DetachedRouteHandle>();

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.component) {
      return null;
    }
    return this.routeCache.get(this.getFullRouteUrl(route)) || null;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return (
      this.routeCache.has(this.getFullRouteUrl(route)) && !!route.component
    );
  }

  /**
   * 当离开当前路由时这个方法会被调用。如果返回true，store方法会被调用。
   * @param route
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle | null
  ): void {
    this.routeCache.set(this.getFullRouteUrl(route), handle);
  }

  private getFullRouteUrl(route: ActivatedRouteSnapshot): string {
    return this.getFullRouteUrlPaths(route).filter(Boolean).join('/');
  }

  private getFullRouteUrlPaths(route: ActivatedRouteSnapshot): string[] {
    const paths = this.getRouteUrlPaths(route);
    return route.parent
      ? [...this.getFullRouteUrlPaths(route.parent), ...paths]
      : paths;
  }

  private getRouteUrlPaths(route: ActivatedRouteSnapshot): string[] {
    return route.url.map((urlSegment) => urlSegment.path);
  }
}
