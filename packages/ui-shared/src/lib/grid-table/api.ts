import { RowNode } from 'ag-grid-community';
import { Observable } from 'rxjs';

export interface Page<T> {
  total: number;
  items: Array<T>;
  statistics?: Array<Statistics>;
}

export interface OrderBy {
  [key: string]: 'order' | 'asc';
}

export interface RequestDataParams {
  size?: number;
  current?: number;
  orderBys?: OrderBy;

  [key: string]: unknown;
}

export type RequestDelete = (node: RowNode) => Observable<void>;

export interface Statistics {
  key: string;
  label?: string;
  skipExport?: boolean;
  className?: string;
  data: Array<{
    key: string;
    label?: string;
    value: unknown;
    className?: string;
  }>;
}


export const QueryFieldTypeArray = [
  'STARTS_WITH',
  'ENDS_WITH',
  'CONTAINS',
  'LIKE',
  'LESSTHAN',
  'LESSTHANEQUAL',
  'EQUALS',
  'NOT_EQUALS',
  'GREATERTHANEQUAL',
  'GREATERTHANE',
  'ORDER_DESC',
  'ORDER_ASC',
] as const;

export type QueryFieldType = (typeof QueryFieldTypeArray)[number];

export interface QueryField {
  type: QueryFieldType;
  filter?: any;
}

/**
 * 查询的字段参数
 */
export class QueryParams {
  [key: string]:
    | QueryField
    | Array<QueryField | string | boolean | number>
    | string
    | number
    | boolean;
}

/**
 * 分页查询的参数
 */
export class QueryPage {
  query: QueryParams;
  current: number;
  size: number;

  [key: string]: unknown;

  constructor(current = 1, size = 10, query: QueryParams) {
    this.current = current;
    this.size = size;
    this.query = query;
  }
}

export interface GridColumnDef {
  columnSort: string[];
  width: { [key: string]: number };
}
