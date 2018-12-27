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
export class CanvasComponent implements OnInit, AfterViewInit {

  columnWidth = 0;
  columnHeight = 0;
  spacingBetweenColumns = 0;
  linkTable: { [sourceCellId: string]: Array<Link> } = {};
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

  @ViewChild('canvas')
  private _canvasRef: ElementRef<SVGSVGElement>;
  private _canvasRect: ClientRect;
  private _sourceCell: Cell;
  private _selectedCell: Cell;
  private _selectedLink: Link;

  constructor(private _changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
  }

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
      if (this._selectedCell) {
        switch (this._selectedCell.column) {
          case 'element':
            this.elementCellDeleted = this._selectedCell;
            break;
          case 'property':
            this.propertyCellDeleted = this._selectedCell;
            break;
          case 'quality':
            this.qualityCellDeleted = this._selectedCell;
        }
        this._deleteCell(this._selectedCell);
        this._notifyLinksChange();
      }
      else if (this._selectedLink) {
        this._deleteLink(this._selectedLink);
        this._notifyLinksChange();
      }
    }
  }

  private _deleteCell(cellToDelete: Cell) {
    this._deleteCellAndAdjustCellIdsAfterDeletedCell(cellToDelete);
    delete this.linkTable[cellToDelete.idSelector];
    for (const sourceCell in this.linkTable)
      for (const link of this.linkTable[sourceCell])
        if (link.target === cellToDelete)
          this._deleteLink(link);
    this._selectedCell = null;
    this.selectedCell = null;
    this._sourceCell = null;
  }

  private _deleteCellAndAdjustCellIdsAfterDeletedCell(deletedCell: Cell) {
    const cells = this.columns[deletedCell.column];
    cells.splice(deletedCell.id, 1);
    for (let i = deletedCell.id; i < cells.length; i++) {
      cells[i].id = i;
      cells[i].idSelector = `${cells[i].column}-cell-${i}`;
    }
  }

  private _deleteLink(link: Link) {
    this.linkTable[link.source.idSelector] = this.linkTable[link.source.idSelector].filter(e => e !== link);
    this._selectedLink = null;
    this.selectedLink = null;
  }

  onColumnLayoutChanged(layoutChange: ColumnLayoutChange) {
    if (
      layoutChange.type === ColumnLayoutChangeType.CELL_ADDED ||
      layoutChange.type === ColumnLayoutChangeType.CELL_HEIGHT_INCREASED
    ) {
      const cells = this.columns[layoutChange.column];
      this._resizeCanvasIfCellOverflows(cells[cells.length - 1]);
    }
    else
      this._shrinkCanvasIfTooMuchEmptyVerticalSpace();
    this._notifyLinksChange();
  }

  private _resizeCanvasIfCellOverflows(cell: Cell) {
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
    this.linkTable = { ...this.linkTable };
  }

  showConnectionsForSelectedComponent(state: boolean) {
    if (state) {
      this.selectedCell = this._selectedCell;
      this.selectedLink = this._selectedLink;
    }
    else {
      this.selectedCell = null;
      this.selectedLink = null;
    }
  }

  onLinkSelected(link: Link) {
    this._selectedLink = link;
    this._selectedCell = null;
    this._sourceCell = null;
  }

  onCellAdded(cell: Cell) {
    cell.id = this.columns[cell.column].length;
    this.columns[cell.column] = this.columns[cell.column].concat(cell);
  }

  onElementCellClicked(cell: Cell) {
    this._sourceCell = this._sourceCell !== cell ? cell : null;
    this._selectedCell = this._sourceCell;
    this._selectedLink = null;
  }

  onPropertyCellClicked(cell: Cell) {
    if (cell === null || cell === this._sourceCell) {
      this._sourceCell = null;
      this._selectedCell = null;
    }
    else if (this._sourceCell && this._sourceCell.column !== 'property') {
      this._addNewLink({
        source: this._sourceCell,
        target: cell
      });
      this._unhighlightCell(this._sourceCell);
      this._unhighlightCell(cell);
      this._notifyLinksChange();
      this._sourceCell = null;
      this._selectedCell = null;
    }
    else {
      this._sourceCell = cell;
      this._selectedCell = this._sourceCell;
    }
    this._selectedLink = null;
  }

  onQualityCellClicked(cell: Cell) {
    if (this._sourceCell && this._sourceCell.column !== 'element') {
      this._addNewLink({
        source: this._sourceCell,
        target: cell
      });
      this._notifyLinksChange();
      this._unhighlightCell(this._sourceCell);
      this._unhighlightCell(cell);
    }
    this._selectedCell = !this._sourceCell ? cell : null;
    this._selectedLink = null;
    this._sourceCell = null;
  }

  private _addNewLink(link: Link) {
    if (!(link.source.idSelector in this.linkTable))
      this.linkTable[link.source.idSelector] = [link];
    else if (!this._linkExists(this.linkTable[link.source.idSelector], link))
      this.linkTable[link.source.idSelector].push(link);
  }

  private _linkExists(links: Link[], newLink: Link) {
    return links.some(e => e.source === newLink.source && e.target === newLink.target);
  }

  private _unhighlightCell(cell: Cell) {
    this._canvasRef.nativeElement.querySelector(`#${cell.idSelector}`).removeAttribute('data-selected');
  }

}