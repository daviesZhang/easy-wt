import { DatePipe, formatCurrency } from '@angular/common';

import { Observable, switchMap, timer } from 'rxjs';

/**
 *根据指定的间隔天数和最后时间,返回一个时间区间数组
 * @param day 间隔天数
 * @param endDate 最后时间
 */
export function getDayRange(
  day: number,
  endDate: (() => Date) | Date = () => new Date()
): Array<Date> {
  const end = typeof endDate === 'function' ? endDate() : endDate;
  end.setHours(23, 59, 59, 999);
  const begin = new Date(end.getTime() - 1000 * 60 * 60 * 24 * (day - 1));
  begin.setHours(0, 0, 0, 0);
  return [begin, end];
}

/**
 *
 * @param date Date
 * @param format string
 */
export function dateToString(
  date: Date,
  format: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  return <string>new DatePipe('zh_CN').transform(date, format);
}

/**
 * 防xss,转译标签
 * @param unsafe 不安全内容
 */
export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 对象转换为post body参数字符串
 * @param params 原始参数对象
 * @param timestamp 对于时间是否转换为时间戳,或根据传入时间格式转换
 * @param removeEmpty 是否移除空参数
 */
export function encodeParams(
  params: { [key: string]: any | any[] } = {},
  {
    timestamp,
    removeEmpty,
  }: { timestamp?: true | string; removeEmpty: boolean } = {
    timestamp: true,
    removeEmpty: true,
  }
): string {
  const paramsString: Array<string> = [];
  const _params = transformParams(params, timestamp, removeEmpty);
  Object.keys(_params).forEach((key) => {
    const value = params[key];
    key = encodePlus(key);
    paramsString.push(`${key}=${encodePlus(value)}`);
  });
  return paramsString.join('&');
}

/**
 * 转换查询参数
 * 去掉空参数,转换时间格式,去掉字符串前后空格
 * @param params
 * @param timestamp 对于时间是否转换为时间戳,或根据传入时间格式转换
 * @param removeEmpty 是否移除空参数
 */
export function transformParams(
  params: {
    [key: string]: any;
  } = {},
  timestamp: string | true = 'yyyy-MM-dd HH:mm:ss',
  removeEmpty = true
): {} {
  params = { ...params };
  Object.values(params)
    .filter(
      (value) =>
        !Array.isArray(value) &&
        typeof value === 'object' &&
        Object.keys(value).length >= 1
    )
    .forEach((value) => Object.assign({}, params, value));
  // @ts-ignore
  return Object.keys(params)
    .map((key) => {
      let value = params[key];
      if (
        !Array.isArray(value) &&
        typeof value === 'object' &&
        Object.keys(value).length >= 1
      ) {
        return null;
      }
      if (removeEmpty) {
        if (
          value === null ||
          value === undefined ||
          (typeof value === 'string' && !value.trim()) ||
          (Array.isArray(value) && !value.length)
        ) {
          return null;
        }
      }
      if (value instanceof Date) {
        if (timestamp === true) {
          value = value.getTime();
        } else {
          value = dateToString(value, timestamp);
        }
      } else if (typeof value === 'string') {
        value = value.trim();
      }
      return { [key]: value };
    })
    .filter((v) => !!v)
    .reduce(
      (previousValue, currentValue) => ({ ...previousValue, ...currentValue }),
      {}
    );
}

/**
 * angular 根据http标准未对+做转译,但是后端框架不认识+,故此转译一次
 * @param value 待转译的值
 */
function encodePlus(value: string = ''): string {
  return value.replace(/\+/gi, '%2B');
}

/**
 * 根据数组构造一个tree结构的数组,添加level字段,展示层级
 * @param data 原始数据
 * @param params { children?: 子项目的key名字, parent?: 获取上级主键值的方法, id?: 获取当前主键值的方法 }
 */
export function getTreeData<T extends { [key: string]: any }>(
  data: Array<T>,
  params: {
    children?: string;
    parent?: (item: T) => string | number;
    id?: (item: T) => string | number;
    isRoot?: (item: T) => boolean;
    sort?: (a: T, b: T) => number;
  }
): Array<T> {
  function childrenList(
    data: Array<T>,
    level: number,
    parentId?: string | number
  ): {
    result: Array<T>;
    other: Array<T>;
  } {
    const childrenList: Array<T> = [];
    const otherList: Array<T> = [];
    for (let item of data) {
      const isChildren =
        parentId === undefined ? isRoot(item) : parent(item) === parentId;
      if (isChildren) {
        childrenList.push(Object.assign({ level: level }, item));
      } else {
        otherList.push(item);
      }
    }
    if (sort) {
      childrenList.sort(sort);
    }
    return { result: childrenList, other: otherList };
  }

  const children = params.children || 'children';
  const parent = params.parent || ((item) => item['parentId']);
  const id = params.id || ((item) => item['id']);
  const isRoot = params.isRoot || ((item) => !parent(item));
  const sort = params.sort;
  let level = 1;
  let { result, other } = childrenList(data, level);
  let hasNext = true;
  let nextData: Array<T> = result;
  while (hasNext) {
    level = level + 1;
    let next: Array<T> = [];
    for (let item of nextData) {
      const childrenData = childrenList(other, level, id(item));
      other = childrenData.other;
      if (childrenData.result.length) {
        Object.assign(item, { [children]: childrenData.result });
        next = [...next, ...childrenData.result];
      }
    }
    nextData = next;
    if (!next.length) {
      hasNext = false;
    }
  }
  return result;
}

/**
 * 根据数组构造一个tree结构的数组
 * @param data 原始数据
 * @param params { children?: string, parentId?: string, id?: string }
 */

/*
export function buildTreeData(data: Array<{[key:string]:any }>,
   params: { children?: string, parentId?: string, id?: string,sort?:string } ): Array<any> {
  const children=params.children||'children';
  const parentId=params.parentId||'parentId';
  const id=params.id||'id';
  const sort=params.sort||'sort';
    data = data.map(item => {
        return {...item, isLeaf: !data.some(_item => _item[parentId] === item[id])};
    });

    const parentGroupMap = new Map<string, Array<{[key:string]:any }>>();
    data.forEach(item => {
        const key = item[parentId];
        let items = parentGroupMap.has(key) ? [item].concat(<Array<{[key:string]:any }>>parentGroupMap.get(key)) : [item];
        items = items.sort(((a, b) => (a[sort] || 0) - (b[sort] || 0)));
        parentGroupMap.set(key, items);
    });
    const result:Array<any> = [];
    data.forEach(item => {
        if (parentGroupMap.has(item[id])) {
            item[children] = parentGroupMap.get(item[id]);
        }
        if (item[parentId] !== null
            && item[parentId] !== undefined
            && item[parentId] !== 0
            && data.some(i => i[id] === item[parentId])) {
            return;
        }
        result.push(item);
    });
    return result;
}
*/

/**
 * 把数据变更为支持在grid里面使用的tree结构
 * @param data 原始数据
 * @param params
 */
export function changeDataToGridTree<T>(
  data: Array<T>,
  params: {
    parent: (item: T) => string | number;
    id: (item: T) => string | number;
  }
): Array<T> {
  const { id, parent } = params;

  function getPid(pid: any, parents: Array<any>) {
    const parentId = data.filter((item) => id(item) === pid);
    if (parentId.length) {
      const p = parentId[0];
      parents = [id(p)].concat(parents);
      if (parent(p)) {
        parents = getPid(parent(p), parents);
      }
    }
    return parents;
  }

  const newData = data.map((item) => ({ ...item }));
  newData.forEach((item) => {
    const path = [id(item)];
    if (parent(item) && id(item) !== parent(item)) {
      Object.assign(item, { path: getPid(parent(item), path) });
    } else {
      Object.assign(item, { path: path });
    }
  });
  return newData;
}

/**
 * 数组分片
 * @param items 数组列表
 * @param size 拆分大小
 */
export function arrayPartition<T>(items: Array<T>, size = 3): Array<Array<T>> {
  const init: Array<Array<T>> = [[]];
  return items.reduce((previousValue, currentValue) => {
    !previousValue.length ||
    previousValue[previousValue.length - 1].length === size
      ? previousValue.push([currentValue])
      : previousValue[previousValue.length - 1].push(currentValue);
    return previousValue;
  }, init);
}

/**
 * 生成 (min)-(max)的随机数
 */
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 为 keys中key在data中的求和 结果四舍五入,保留两位小数
 * @param data
 * @param keys
 * @param currency 是否转换为货币模式
 */
export function sum(
  data: Array<{ [key: string]: any }>,
  keys: Array<string>,
  currency = true
): {
  [key: string]: number | string | null;
} {
  const result = data.reduce((previousValue, currentValue) => {
    Object.keys(currentValue)
      .filter((key) => keys.indexOf(key) >= 0)
      .map((key) => {
        let current = parseFloat(currentValue[key]);
        current = Number.isNaN(current) ? 0 : current;
        const previous = previousValue[key] || 0;
        previousValue[key] = previous + current;
      });
    return previousValue;
  }, {});
  Object.keys(result).forEach((key) => {
    if (Number.isNaN(result[key])) {
      result[key] = null;
    } else if (currency) {
      result[key] = formatCurrency(
        parseFloat(result[key].toFixed(2)),
        'zh_CN',
        '',
        'CNY'
      );
    } else {
      result[key] = parseFloat(result[key].toFixed(2));
    }
  });
  return result;
}

export function amountFormatter(
  value: string,
  digitsInfo?: string | undefined
) {
  return formatCurrency(parseFloat(value), 'zh_CN', '', 'CNY', digitsInfo);
}

/**
 * rxjs 间隔重试
 * @param retry 负数 一直重试,不停止
 * @param scalingDuration
 * @param onError 当发生错误时调用
 */
export function rxRetryWhen(
  retry = 3,
  scalingDuration = 1000,
  onError?: (error: unknown, index: number) => void
) {
  return (errors$: Observable<unknown>): Observable<unknown> => {
    return errors$.pipe(
      switchMap((error, index) => {
        if (onError) {
          onError(error, index);
        }
        if (retry >= 0 && index >= retry) {
          throw error;
        }
        let value = index;
        if (retry < 0) {
          value = Math.min(5, index);
        }
        return timer(scalingDuration * (value + 1));
      })
    );
  };
}
