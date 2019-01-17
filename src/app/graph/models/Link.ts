import { Cell } from './Cell';

export interface Link {
  source: Cell;
  target: Cell;
  idSelector: string;
  weight: number;
  domInstance: SVGGElement;
}