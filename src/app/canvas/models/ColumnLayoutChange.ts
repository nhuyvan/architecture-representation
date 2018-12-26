import { Cell } from './Cell';

export interface ColumnLayoutChange {
  lastCellInColumn: Cell;
  cellsInColumn: Map<Cell, ClientRect>;
  columnHeight?: number;
}