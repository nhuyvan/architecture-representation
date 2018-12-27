import { Cell } from './Cell';

export type ColumnId = 'element' | 'property' | 'quality';

export type Column = {
  [columnId in ColumnId]: Cell[];
};