import { Cell } from './Cell';

export type ColumnId = 'element' | 'property' | 'quality';

export type Column = {
  [columnId in ColumnId]: Map<Cell, ClientRect>
};