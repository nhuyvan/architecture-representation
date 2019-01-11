import { ColumnId } from './Column';
import { CellGroup } from './CellGroup';

export interface Cell {
  id: number;
  top: number;
  left: number;
  width: number;
  height: number;
  text: string;
  column: ColumnId;
  idSelector: string;
  domInstance: SVGGElement;
  cellGroup: CellGroup;
  isOn: boolean;
  weight: number;
}
