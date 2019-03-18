import { ColumnId } from './Column';
import { CellGroup } from './CellGroup';
import { CellGraphModel } from '@shared/graph-model';

export class Cell {

  top = 0;
  left = 0;
  width = 0;
  height = 50;
  text = 'Double click to add text';
  domInstance: SVGGElement = null;
  cellGroup: CellGroup = null;
  isOn = true;
  weight = 0;

  constructor(public id: number, public idSelector: string, public column: ColumnId) {
  }

  static fromCellGraphModel(cellGraphModel: CellGraphModel): Cell {
    const newCell = new Cell(cellGraphModel.id, cellGraphModel.idSelector, cellGraphModel.column as ColumnId);
    newCell.isOn = cellGraphModel.isOn;
    newCell.text = cellGraphModel.text;
    newCell.weight = cellGraphModel.weight;
    return newCell;
  }

  constructCellGraphModel(): CellGraphModel {
    return {
      id: this.id,
      text: this.text,
      column: this.column,
      idSelector: this.idSelector,
      cellGroup: this.cellGroup.id,
      isOn: this.isOn,
      weight: this.weight
    };
  }

}
