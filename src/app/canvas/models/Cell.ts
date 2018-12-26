import { ColumnId } from './Column';

export interface Cell extends SVGGElement {
  dataset: {
    id: string;
    columnPrefix: ColumnId;
    text: string;
    selected: string;
  }
}