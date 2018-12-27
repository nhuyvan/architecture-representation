import { Cell } from './Cell';
import { ColumnId } from './Column';

export interface ColumnLayoutChange {
  column: ColumnId;
  type: ColumnLayoutChangeType;
}

export enum ColumnLayoutChangeType {
  CELL_ADDED, CELL_REMOVED, CELL_HEIGHT_REDUCED, CELL_HEIGHT_INCREASED
}