import { Cell } from './Cell';

export class CellGroup {
  static readonly DEFAULT_SPACING_BETWEEN_CELLS = 5;
  private _cells: Cell[] = [];

  constructor(readonly useDefaultSpacing: boolean) {

  }

  addCell(cell: Cell) {
    if (this._cells.every(existingCell => existingCell !== cell))
      this._cells.push(cell);
  }

  addCells(cells: Cell[]) {
    cells.forEach(cell => this.addCell(cell));
  }

  getTotalHeight() {
    if (this._cells.length === 0)
      return 0;
    const totalHeightOfAllCells = this._cells.reduce((totalHeight, cell) => totalHeight + cell.height, 0);
    const totalSpacingBetweenCells = CellGroup.DEFAULT_SPACING_BETWEEN_CELLS * (this._cells.length + 1)
    return totalHeightOfAllCells + totalSpacingBetweenCells;
  }

  removeCell(cell: Cell) {
    for (let i = 0; i < this._cells.length; i++)
      if (this._cells[i] === cell)
        return this._cells.splice(i, 1)[0];
    return null;
  }

  clone(): CellGroup {
    const clone = new CellGroup(this.useDefaultSpacing);
    clone._cells = [...clone._cells];
    return clone;
  }
}