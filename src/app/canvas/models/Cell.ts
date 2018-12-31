import { ColumnId } from './Column';

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
}
