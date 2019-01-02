import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, HostListener } from '@angular/core';

import { Link } from './models/Link';
import { Column, ColumnId } from './models/Column';
import { Cell } from './models/Cell';
import { ColumnLayoutChange, ColumnLayoutChangeType } from './models/ColumnLayoutChange';
import { CellSelectionEvent, CellSelectionEventType } from './models/CellSelectionEvent';

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
  selectedLink: Link;
  readonly columns: Column = {
    element: [],
    property: [],
    quality: []
  };
  selectedCells: Cell[] = [];
  showAssociations = false;

  @ViewChild('canvas')
  private _canvasRef: ElementRef<SVGSVGElement>;
  private _canvasRect: ClientRect;

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
    }, 1000);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      if (this.selectedCells.length > 0) {
        this._deleteSelectedCells();
        this.selectedCells = [];
        this._notifyLinksChange();
        this._shrinkCanvasIfTooMuchEmptyVerticalSpace();
      }
      else if (this.selectedLink) {
        this._notifyLinksChange();
        this._deleteLink(this.selectedLink);
      }
    }
  }

  private _deleteSelectedCells() {
    for (const cellToDelete of this.selectedCells) {
      this.columns[cellToDelete.column] = this.columns[cellToDelete.column].filter(cell => cell !== cellToDelete);
      this.linkTable.delete(cellToDelete);
      this.linkTable.forEach(links => {
        for (const link of links)
          if (link.target === cellToDelete)
            this._deleteLink(link);
      });
    }
    this._adjustCellIds(new Set<ColumnId>(this.selectedCells.map(cell => cell.column)));
    this._adjustLinkSelectorsInLinkTable();
  }

  private _adjustCellIds(affectedColumns: Set<ColumnId>) {
    for (const affectedColumn of affectedColumns) {
      const cells = this.columns[affectedColumn];
      for (let index = 0; index < cells.length; index++) {
        const cell = cells[index];
        cell.id = index;
        cell.idSelector = `${cell.column}-cell-${index}`;
      }
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
    switch (layoutChange.type) {
      case ColumnLayoutChangeType.CELL_ADDED:
      case ColumnLayoutChangeType.CELL_HEIGHT_INCREASED:
        const cells = this.columns[layoutChange.column];
        this._expandCanvasIfCellOverflowsColumn(cells[cells.length - 1]);
        this._notifyLinksChange();
        break;
      case ColumnLayoutChangeType.CELL_HEIGHT_DECREASED:
        this._shrinkCanvasIfTooMuchEmptyVerticalSpace();
        this._notifyLinksChange();
        break;
    }
    this.selectedCells = this.selectedCells.filter(selected => selected !== layoutChange.trigger);
  }

  private _expandCanvasIfCellOverflowsColumn(cell: Cell) {
    const cellBottom = cell.top + cell.height;
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
    this.selectedCells = [];
    this.selectedLink = link;
  }

  onCellAdded(columnId: ColumnId) {
    const newCell = this._createNewCell(columnId);
    this.columns[columnId] = this.columns[columnId].concat(newCell);
    // Wait until the new cell was rendered, then highlight it
    setTimeout(() => {
      this.selectedCells = [newCell];
      this._changeDetector.detectChanges();
    }, 0);
  }

  private _createNewCell(columnId: ColumnId): Cell {
    return {
      id: this.columns[columnId].length,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      text: 'Double click to add text',
      column: columnId,
      idSelector: `${columnId}-cell-${this.columns[columnId].length}`,
      domInstance: null
    }
  }

  onElementCellClicked(selectionEvent: CellSelectionEvent) {
    this._addToOrRemoveFromSelectedCells(selectionEvent);
    this.selectedLink = null;
  }

  onPropertyCellClicked(selectionEvent: CellSelectionEvent) {
    // Only "element" column can add links to "element" column
    this._renderLinksOrAddToOrRemoveFromSelectedCells('element', selectionEvent);
  }

  onQualityCellClicked(selectionEvent: CellSelectionEvent) {
    // Only "property" column can add links to "property" column
    this._renderLinksOrAddToOrRemoveFromSelectedCells('property', selectionEvent);
  }

  private _renderLinksOrAddToOrRemoveFromSelectedCells(sourceColumn: 'element' | 'property', event: CellSelectionEvent) {
    switch (event.type) {
      case CellSelectionEventType.NEW_SELECTION:
        if (this.selectedCells.length > 0) {
          const addedLinks = this.selectedCells.map(e => e.column === sourceColumn && this._addNewLink(e, event.cell))
            .filter(added => added);
          if (addedLinks.length > 0)
            this._notifyLinksChange();
          else
            this._addToOrRemoveFromSelectedCells(event);
        }
        else
          this._addToOrRemoveFromSelectedCells(event);
        break;
      default:
        this._addToOrRemoveFromSelectedCells(event);
        break;
    }
    this.selectedLink = null;
  }

  private _addToOrRemoveFromSelectedCells(selectionEvent: CellSelectionEvent) {
    switch (selectionEvent.type) {
      case CellSelectionEventType.UNSELECT:
        this.selectedCells = this.selectedCells.filter(selectedCell => selectedCell !== selectionEvent.cell);
        break;
      case CellSelectionEventType.NEW_SELECTION:
        this.selectedCells = [selectionEvent.cell];
        break;
      case CellSelectionEventType.SELECT:
        this.selectedCells = this.selectedCells.concat(selectionEvent.cell);
        break;
    }
  }

  private _addNewLink(source: Cell, target: Cell) {
    const newLink = {
      source,
      target,
      idSelector: source.idSelector + '_' + target.idSelector,
      weight: 1.0,
      domInstance: null
    };

    if (!this.linkTable.has(source)) {
      this.linkTable.set(source, [newLink]);
      return true;
    }
    else if (!this._linkExists(this.linkTable.get(source), newLink)) {
      this.linkTable.get(source)
        .push(newLink);
      return true;
    }
    return false;
  }

  private _linkExists(links: Link[], newLink: Link) {
    return links.some(e => e.source === newLink.source && e.target === newLink.target);
  }

}