import { Cell } from './Cell';
import { GroupGraphModel } from './GraphModel';

export class CellGroup {
  public readonly cells: Cell[] = [];
  constructor(
    public id: number,
    readonly useDefaultSpacing: boolean,
    public left: number,
    public top: number,
    public width: number,
    public height: number
  ) {

  }

  addCell(cell: Cell) {
    if (this.cells.every(existingCell => existingCell !== cell)) {
      this.cells.push(cell);
      this.cells.sort((a, b) => a.id - b.id);
      cell.cellGroup = this;
    }
  }

  newestCell() {
    return this.cells[this.cells.length - 1];
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
    const clone = new CellGroup(this.id, this.useDefaultSpacing, this.left, this.top, this.width, this.height);
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
      useDefaultSpacing: this.useDefaultSpacing,
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height
    }
  }
}