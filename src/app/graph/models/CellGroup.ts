import { Cell } from './Cell';
import { GroupGraphModel } from '@shared/graph-model';

export class CellGroup {
  public readonly cells: Cell[] = [];
  public left = 0;
  public top = 0;
  public width = 0;
  public height = 0;
  constructor(public id: number, readonly useDefaultSpacing: boolean) {
  }

  addCell(cell: Cell) {
    if (this.cells.every(existingCell => existingCell !== cell)) {
      this.cells.push(cell);
      this.cells.sort((a, b) => a.id - b.id);
      cell.cellGroup = this;
    }
  }

  calculateMinimumHeight() {
    if (this.cells.length === 0)
      return 0;
    const totalHeightOfAllCells = this.cells.reduce((totalHeight, cell) => totalHeight + cell.height, 0);
    const totalSpacingBetweenCells = this.defaultSpacingBetweenCells() * (this.cells.length + 1);
    this.height = totalHeightOfAllCells + totalSpacingBetweenCells;
    return this.height;
  }

  defaultSpacingBetweenCells() {
    return this.useDefaultSpacing ? 10 : 5;
  }

  removeCell(cell: Cell) {
    for (let i = 0; i < this.cells.length; i++)
      if (this.cells[i] === cell)
        return this.cells.splice(i, 1)[0];
    return null;
  }

  size() {
    return this.cells.length;
  }

  clone(): CellGroup {
    const clone = new CellGroup(this.id, this.useDefaultSpacing);
    clone.left = this.left;
    clone.top = this.top;
    clone.width = this.width;
    clone.height = this.height;
    for (const cell of this.cells) {
      cell.cellGroup = clone;
      clone.cells.push(cell);
    }
    return clone;
  }

  constructGroupGraphModel(): GroupGraphModel {
    return {
      id: this.id,
      cells: this.cells.map(cell => ({ id: cell.id, column: cell.column })),
      useDefaultSpacing: this.useDefaultSpacing
    };
  }

}
