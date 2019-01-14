import { Cell } from './Cell';
import { ColumnId } from './Column';

export interface ColumnLayoutChange {
  column: ColumnId;
  type: ColumnLayoutChangeType;
  trigger: Cell;
}

export enum ColumnLayoutChangeType {
  CELL_ADDED, CELL_HEIGHT_DECREASED, CELL_HEIGHT_INCREASED
}