import { Cell } from './Cell';

export enum CellSelectionEventType {
  NEW_SELECTION, UNSELECT, SELECT
}
export interface CellSelectionEvent {
  cell: Cell;
  type: CellSelectionEventType;
}
