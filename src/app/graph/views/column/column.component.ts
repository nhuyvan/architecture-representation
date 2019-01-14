import { Component, Input, ViewEncapsulation, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, HostListener } from '@angular/core';

import { ColumnLayoutChangeType } from '../../models/ColumnLayoutChange';
import { CellSelectionEvent, CellSelectionEventType } from '../../models/CellSelectionEvent';
import { CellGroup } from '../../models/CellGroup';
import { ColumnLayoutChangeService } from '../../services/column-layout-change.service';

@Component({
  selector: 'g[column]',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'column'
  }
})
export class ColumnComponent implements OnChanges, OnInit {

  @Input()
  width: number;

  @Input()
  height: number;

  @Input()
  left = 0;

  @Input()
  cellGroups: CellGroup[] = [];

  @Output()
  cellClicked = new EventEmitter<CellSelectionEvent>();

  private static readonly _MINIMUM_SPACING_BETWEEN_GROUPS = 10;
  private _defaultCellGroup: CellGroup;

  constructor(private _layoutChange: ColumnLayoutChangeService) {
  }

  ngOnInit() {
    this._layoutChange.observe()
      .subscribe(layoutChange => {
        if (layoutChange.type === ColumnLayoutChangeType.CELL_HEIGHT_DECREASED)
          this._reRenderAllGroups();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    this._defaultCellGroup = this.cellGroups[this.cellGroups.length - 1];
    this._defaultCellGroup.width = this.width;

    if ('cellGroups' in changes && !changes.cellGroups.firstChange && this.cellGroups.length > 0)
      this._reRenderAllGroups();

    if ('height' in changes && !changes.height.firstChange && this._defaultCellGroup)
      this._reRenderAllGroups();
  }

  private _reRenderAllGroups() {
    if (this.cellGroups.length > 0) {
      const spacingBetweenGroups = this._calculateSpacingBetweenGroups();
      this._updateTopAndLeftPositionsOfAllGroups(spacingBetweenGroups);
      if (this._defaultCellGroup.size() > 0)
        this._calculateDefaultGroupHeight(spacingBetweenGroups);
    }
  }

  private _calculateSpacingBetweenGroups() {
    if (this.cellGroups.length === 1)
      return 0;
    const totalHeightOfNonDefaultGroups = this._calculateTotalHeightOfNonDefaultGroups();
    const heightOfAllCellsInDefaultGroup = this._defaultCellGroup.cells.reduce((sum, cell) => sum + cell.height, 0);
    const remainingHeight = this.height - totalHeightOfNonDefaultGroups - heightOfAllCellsInDefaultGroup;
    if (this._defaultCellGroup.size() === 0)
      return Math.max(ColumnComponent._MINIMUM_SPACING_BETWEEN_GROUPS, remainingHeight / this.cellGroups.length);
    // For "n" items, there are "n + 1" spacings between them
    return Math.max(ColumnComponent._MINIMUM_SPACING_BETWEEN_GROUPS, remainingHeight / (this.cellGroups.length + this._defaultCellGroup.size() + 1));
  }

  private _calculateTotalHeightOfNonDefaultGroups() {
    // Default group is always the last element
    return this.cellGroups.slice(0, this.cellGroups.length - 1)
      .reduce((sum, group) => sum + group.calculateMinimumHeight(), 0);
  }

  private _updateTopAndLeftPositionsOfAllGroups(spacingBetweenGroups: number) {
    let currentTop = spacingBetweenGroups;
    for (const cellGroup of this.cellGroups) {
      cellGroup.top = currentTop;
      cellGroup.left = this.left;
      currentTop = Math.max(0, currentTop + cellGroup.height + spacingBetweenGroups);
    }
  }

  private _calculateDefaultGroupHeight(spacingBetweenGroups: number) {
    if (this.cellGroups.length === 1)
      this._defaultCellGroup.height = this.height;
    else if (this._defaultCellGroup.size() > 0) {
      const totalHeightOfNonDefaultGroups = this._calculateTotalHeightOfNonDefaultGroups();
      this._defaultCellGroup.height = this.height - totalHeightOfNonDefaultGroups
        // For "N" groups, there are "N + 1" spacings between them
        // But because the default group is in the cell groups array
        // The number of spacings is 1 less than cell groups array's length
        // Instead of length + 1
        - spacingBetweenGroups * (this.cellGroups.length + 1);
    }
  }

  cellGroupArrayTrackBy(_, cellGroup: CellGroup) {
    return cellGroup.size();
  }

  @HostListener('click', ['$event.target.parentElement', '$event'])
  onCellClicked(target: HTMLElement | SVGElement | any, event: MouseEvent) {
    if (target.hasAttribute('data-cell')) {
      const cell = target.__cell__;
      if (cell.domInstance.hasAttribute('data-selected'))
        this.cellClicked.emit({ cell, type: CellSelectionEventType.UNSELECT });
      else
        this.cellClicked.emit({
          cell,
          type: event.shiftKey ? CellSelectionEventType.SELECT : CellSelectionEventType.NEW_SELECTION
        });
    }
  }

}