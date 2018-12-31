import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, HostListener } from '@angular/core';

import { Link } from './models/Link';
import { Column, ColumnId } from './models/Column';
import { Cell } from './models/Cell';
import { ColumnLayoutChange, ColumnLayoutChangeType } from './models/ColumnLayoutChange';

@Component({
  selector: 'mapper-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CanvasComponent implements AfterViewInit {

  columnWidth = 0;
  columnHeight = 0;
  spacingBetweenColumns = 0;
  linkTable = new Map<Cell, Array<Link>>();
  selectedCell: Cell;
  selectedLink: Link;
  readonly columns: Column = {
    element: [],
    property: [],
    quality: []
  };
  elementCellDeleted: Cell;
  propertyCellDeleted: Cell;
  qualityCellDeleted: Cell;
  showAssociations = false;

  @ViewChild('canvas')
  private _canvasRef: ElementRef<SVGSVGElement>;
  private _canvasRect: ClientRect;
  private _sourceCell: Cell;

  constructor(private _changeDetector: ChangeDetectorRef) { }

  ngAfterViewInit() {
    // ExpressionChangedAfterItHasBeenCheckedError avoidance because this is ngAfterViewInit
    setTimeout(() => {
      this._canvasRect = this._canvasRef.nativeElement.getBoundingClientRect();
      // 12.5% each
      this.spacingBetweenColumns = this._canvasRect.width * 12.5 / 100;
      // 25% each
      this.columnWidth = this._canvasRect.width * 25 / 100;
      this.columnHeight = this._canvasRect.height;
      this._changeDetector.markForCheck();
    }, 1000)
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      if (this.selectedCell) {
        switch (this.selectedCell.column) {
          case 'element':
            this.elementCellDeleted = this.selectedCell;
            break;
          case 'property':
            this.propertyCellDeleted = this.selectedCell;
            break;
          case 'quality':
            this.qualityCellDeleted = this.selectedCell;
        }
        this._deleteCell(this.selectedCell);
        this._notifyLinksChange();
      }
      else if (this.selectedLink) {
        this._deleteLink(this.selectedLink);
        this._notifyLinksChange();
      }
    }
  }

  private _deleteCell(cellToDelete: Cell) {
    this.linkTable.delete(cellToDelete);
    this._deleteCellAndAdjustCellIdsAfterDeletedCell(cellToDelete);
    this.linkTable.forEach(links => {
      for (const link of links)
        if (link.target === cellToDelete)
          this._deleteLink(link);
    });
    this.selectedCell = null;
    this._sourceCell = null;
    this._adjustLinkSelectorsInLinkTable();
  }

  private _deleteCellAndAdjustCellIdsAfterDeletedCell(deletedCell: Cell) {
    const cells = this.columns[deletedCell.column];
    cells.splice(deletedCell.id, 1);
    for (let i = deletedCell.id; i < cells.length; i++) {
      const cell = cells[i];
      cell.id = i;
      cell.idSelector = `${cell.column}-cell-${i}`;
    }
  }

  private _adjustLinkSelectorsInLinkTable() {
    this.linkTable.forEach(links => {
      for (const link of links)
        link.idSelector = link.source.idSelector + '_' + link.target.idSelector;
    });
  }

  private _deleteLink(link: Link) {
    const updatedLinks = this.linkTable.get(link.source)
      .filter(e => e !== link);
    if (updatedLinks.length === 0)
      this.linkTable.delete(link.source);
    else
      this.linkTable.set(link.source, updatedLinks);
    this.selectedLink = null;
  }

  onColumnLayoutChanged(layoutChange: ColumnLayoutChange) {
    if (
      layoutChange.type === ColumnLayoutChangeType.CELL_ADDED ||
      layoutChange.type === ColumnLayoutChangeType.CELL_HEIGHT_INCREASED
    ) {
      const cells = this.columns[layoutChange.column];
      this._resizeCanvasIfCellOverflowsCanvas(cells[cells.length - 1]);
    }
    else if (layoutChange.type === ColumnLayoutChangeType.CELL_HEIGHT_UNCHANGED) {
      this.selectedCell = null;
      this._sourceCell = null;
    }
    else
      this._shrinkCanvasIfTooMuchEmptyVerticalSpace();
    this._notifyLinksChange();
  }

  private _resizeCanvasIfCellOverflowsCanvas(cell: Cell) {
    const cellBottom = cell.top + cell.height
    if (cellBottom > this._canvasRect.height) {
      this._canvasRef.nativeElement.style.height = this._canvasRect.height
        + (cellBottom - this._canvasRect.bottom) + 5
        + (document.documentElement.scrollTop || document.body.scrollTop)
        + 'px';
      this._canvasRect = this._canvasRef.nativeElement.getBoundingClientRect();
      this.columnHeight = this._canvasRect.height;
    }
  }

  private _shrinkCanvasIfTooMuchEmptyVerticalSpace() {
    const largestColumnActualHeight = Object.values(this.columns)
      .map(cells => this._calculateActualColumnHeight(cells))
      .reduce((largest, columnActualHeight) => Math.max(largest, columnActualHeight), 0);

    const emptyVerticalSpace = this._canvasRect.height - largestColumnActualHeight;
    // 10 is the padding between the last cell and the canvas bottom border
    if (emptyVerticalSpace > 10) {
      const adjustedHeight = Math.max(this._canvasRect.height - (emptyVerticalSpace - 10), document.body.clientHeight);
      this._canvasRef.nativeElement.style.height = adjustedHeight + 'px';
      this.columnHeight = adjustedHeight;
      this._canvasRect = this._canvasRef.nativeElement.getBoundingClientRect();
      this.columns.element = [...this.columns.element];
      this.columns.property = [...this.columns.property];
      this.columns.quality = [...this.columns.quality];
      this._changeDetector.detectChanges();
    }
  }

  private _calculateActualColumnHeight(cells: Cell[]) {
    const columnHeaderHeight = 100;
    const minimumSpacingBetweenCells = 5;
    return columnHeaderHeight + this._sumCellHeights(cells) + minimumSpacingBetweenCells * (cells.length + 1);
  }

  private _sumCellHeights(cells: Cell[]) {
    return cells.reduce((sum, cell) => sum + cell.height, 0);
  }

  private _notifyLinksChange() {
    this.linkTable = new Map<Cell, Link[]>(this.linkTable);
  }

  toggleAssociationsForSelectedComponent(state: boolean) {
    this.showAssociations = state;
  }

  onLinkSelected(link: Link) {
    this.selectedLink = link;
    this.selectedCell = null;
    this._sourceCell = null;
  }

  onCellAdded(cell: Cell) {
    cell.id = this.columns[cell.column].length;
    this.columns[cell.column] = this.columns[cell.column].concat(cell);
  }

  onElementCellClicked(cell: Cell) {
    this._sourceCell = this._sourceCell !== cell ? cell : null;
    this.selectedCell = this._sourceCell;
    this.selectedLink = null;
  }

  onPropertyCellClicked(cell: Cell) {
    if (cell === this._sourceCell)
      this._sourceCell = null;
    // Only "element" column can add links to "property" column
    else if (this._sourceCell && this._sourceCell.column === 'element') {
      const added = this._addNewLink(this._createLink(this._sourceCell, cell));
      if (added) {
        this._notifyLinksChange();
        this._sourceCell = null;
      }
      // If there is a link already exists between the source and target
      // Then highlight the target cell
      else {
        this._sourceCell = null;
        this.selectedCell = cell;
        return;
      }
    }
    else
      this._sourceCell = cell;
    this.selectedCell = this._sourceCell;
    this.selectedLink = null;
  }

  onQualityCellClicked(cell: Cell) {
    if (this._sourceCell && this._sourceCell.column === 'property') {
      const added = this._addNewLink(this._createLink(this._sourceCell, cell));
      if (added) {
        this._notifyLinksChange();
        this.selectedCell = null;
      }
      // If there is a link already exists between the source and target
      // Then highlight the target cell
      else
        this.selectedCell = cell;
    }
    else
      this.selectedCell = this._sourceCell === cell ? null : cell;
    this.selectedLink = null;
    this._sourceCell = null;
  }

  private _createLink(source: Cell, target: Cell): Link {
    return {
      source,
      target,
      idSelector: source.idSelector + '_' + target.idSelector,
      weight: 1.0,
      domInstance: null
    };
  }

  private _addNewLink(link: Link) {
    if (!this.linkTable.has(link.source)) {
      this.linkTable.set(link.source, [link]);
      return true;
    }
    else if (!this._linkExists(this.linkTable.get(link.source), link)) {
      this.linkTable.get(link.source)
        .push(link);
      return true;
    }
    return false;
  }

  private _linkExists(links: Link[], newLink: Link) {
    return links.some(e => e.source === newLink.source && e.target === newLink.target);
  }

}