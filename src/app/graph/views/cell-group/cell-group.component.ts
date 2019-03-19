import { Component, Input, Host, ElementRef, OnChanges, OnDestroy } from '@angular/core';

import { CellGroup } from '../../models/CellGroup';
import { Cell } from '../../models/Cell';
import { ColumnLayoutChangeType } from '../../models/ColumnLayoutChange';
import { ColumnLayoutChangeService } from '../../services/column-layout-change.service';

@Component({
  selector: 'g[cell-group]',
  templateUrl: './cell-group.component.html',
  styleUrls: ['./cell-group.component.scss']
})
export class CellGroupComponent implements OnChanges, OnDestroy {

  private static _marginLeft = 0;
  private static _cellWidth = 0;
  @Input()
  cellGroup: CellGroup;

  borderLeft = 0;
  borderTop = 0;
  borderWidth = 0;
  borderHeight = 0;
  cells: Cell[] = [];

  private _cellContainer: SVGGElement;


  constructor(
    @Host() host: ElementRef<SVGGElement>,
    private _columnLayoutChange: ColumnLayoutChangeService
  ) {
    this._cellContainer = host.nativeElement;
  }

  ngOnChanges() {
    if (this.cellGroup) {
      if (CellGroupComponent._cellWidth === 0)
        this._calculateCellMarginLeftAndWidth();

      if (this.cellGroup.size() > 0) {
        this.borderLeft = this.cellGroup.left + CellGroupComponent._marginLeft / 2;
        this.borderTop = this.cellGroup.top;
        this.borderWidth = this.cellGroup.width - CellGroupComponent._marginLeft;
        this.borderHeight = this.cellGroup.height;

        this._centerCellsInColumn();
        this._columnLayoutChange.notify(ColumnLayoutChangeType.CELL_ADDED, this.cellGroup.cells[this.cellGroup.size() - 1]);
      } else if (this._cellContainer.parentElement)
        this._cellContainer.parentElement.removeChild(this._cellContainer);
    }
  }

  private _calculateCellMarginLeftAndWidth() {
    CellGroupComponent._marginLeft = this.cellGroup.width * 5 / 100;
    CellGroupComponent._cellWidth = this.cellGroup.width * 90 / 100;
  }

  private _centerCellsInColumn() {
    const spacingBetweenCells = this._calculateSpacingBetweenCells();
    let topOfCurrentCell = spacingBetweenCells + this.cellGroup.top;
    for (const cell of this.cellGroup.cells) {
      cell.top = topOfCurrentCell;
      cell.left = this.cellGroup.left + CellGroupComponent._marginLeft;
      if (cell.width === 0)
        cell.width = CellGroupComponent._cellWidth;
      topOfCurrentCell = Math.max(this.cellGroup.top, topOfCurrentCell + cell.height + spacingBetweenCells);
    }
    this.cells = [...this.cellGroup.cells];
  }

  private _calculateSpacingBetweenCells() {
    if (this.cellGroup.useDefaultSpacing)
      return this.cellGroup.defaultSpacingBetweenCells();
    const totalHeightOfAllCells = this.cellGroup.cells.reduce((sum, cell) => sum + cell.height, 0);
    const remainingHeight = this.cellGroup.height - totalHeightOfAllCells;
    return Math.max(this.cellGroup.defaultSpacingBetweenCells(), remainingHeight / (this.cellGroup.size() + 1));
  }

  ngOnDestroy() {
    if (this._cellContainer && this._cellContainer.parentElement)
      this._cellContainer.parentElement.removeChild(this._cellContainer);
  }

}
