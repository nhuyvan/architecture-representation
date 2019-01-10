import { Component, Input, Host, ElementRef, OnChanges, OnDestroy } from '@angular/core';

import { CellGroup } from '../../models/CellGroup';
import { Cell } from '../../models/Cell';
import { ColumnLayoutChangeType } from '../../models/ColumnLayoutChange';
import { ColumnLayoutChangeService } from 'app/canvas/services/column-layout-change.service';

@Component({
  selector: 'g[cell-group]',
  templateUrl: './cell-group.component.html',
  styleUrls: ['./cell-group.component.scss']
})
export class CellGroupComponent implements OnChanges, OnDestroy {

  @Input()
  cellGroup: CellGroup;
  borderLeft = 0;
  borderTop = 0;
  borderWidth = 0;
  borderHeight = 0;

  cells: Cell[] = [];

  private static readonly _DEFAULT_CELL_HEIGHT = 50;
  private _cellContainer: SVGGElement;
  private _marginLeft = 0;
  private _cellWidth = 0;

  constructor(
    @Host() host: ElementRef<SVGGElement>,
    private _columnLayoutChange: ColumnLayoutChangeService
  ) {
    this._cellContainer = host.nativeElement;
  }

  ngOnChanges() {
    if (this.cellGroup) {
      if (this._cellWidth === 0)
        this._calculateCellMarginLeftAndWidth();

      if (this.cellGroup.size() > 0) {
        const newestCell = this.cellGroup.newestCell();
        if (newestCell.height === 0 || newestCell.width === 0) {
          newestCell.width = this._cellWidth;
          newestCell.height = CellGroupComponent._DEFAULT_CELL_HEIGHT;
          newestCell.left = this.cellGroup.left + this._marginLeft;
        }
        this.borderLeft = this.cellGroup.left + this._marginLeft / 2;
        this.borderTop = this.cellGroup.top;
        this.borderWidth = this.cellGroup.width - this._marginLeft;
        this.borderHeight = this.cellGroup.height;

        this._centerCellsInColumn();
        this._columnLayoutChange.notify(this.cellGroup.cells[0].column, ColumnLayoutChangeType.CELL_ADDED, null);
      }
      else if (this._cellContainer.parentElement)
        this._cellContainer.parentElement.removeChild(this._cellContainer);
    }
  }

  ngOnDestroy() {
    if (this._cellContainer && this._cellContainer.parentElement)
      this._cellContainer.parentElement.removeChild(this._cellContainer);
  }

  private _calculateCellMarginLeftAndWidth() {
    this._marginLeft = this.cellGroup.width * 5 / 100;
    this._cellWidth = this.cellGroup.width * 90 / 100;
  }

  private _centerCellsInColumn() {
    const spacingBetweenCells = this._calculateSpacingBetweenCells();
    let topOfCurrentCell = spacingBetweenCells + this.cellGroup.top;
    for (let i = 0; i < this.cellGroup.cells.length; i++) {
      const cell = this.cellGroup.cells[i];
      cell.top = topOfCurrentCell;
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

}