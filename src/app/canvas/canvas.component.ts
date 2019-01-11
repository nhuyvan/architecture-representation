import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, HostListener, OnInit, Host } from '@angular/core';
import { zeros, Matrix, multiply, ones, subtract, matrix } from 'mathjs';
import { MatDialog } from '@angular/material/dialog';
import { MatricesComponent } from './views/matrices/matrices.component';

import { Link } from './models/Link';
import { Column, ColumnId } from './models/Column';
import { Cell } from './models/Cell';
import { ColumnLayoutChange, ColumnLayoutChangeType } from './models/ColumnLayoutChange';
import { CellSelectionEvent, CellSelectionEventType } from './models/CellSelectionEvent';
import { ColumnLayoutChangeService } from './services/column-layout-change.service';
import { CellGroup } from './models/CellGroup';
import { CommandService, Command } from '@shared/services/command.service';

@Component({
  selector: 'mapper-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'frame'
  }
})
export class CanvasComponent implements AfterViewInit, OnInit {

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
  readonly cellGroups = {
    element: [new CellGroup(false, 0, 0, 0, 0)],
    property: [new CellGroup(false, 0, 0, 0, 0)],
    quality: [new CellGroup(false, 0, 0, 0, 0)]
  }
  selectedCells: Cell[] = [];
  showAssociations = false;

  private _canvas: SVGSVGElement;
  private _canvasRect: ClientRect;
  private _canvasInitialHeight = 0;

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _columnLayoutChange: ColumnLayoutChangeService,
    private _commandService: CommandService,
    @Host() private readonly _canvasContainerRef: ElementRef<HTMLElement>,
    private _matDialog: MatDialog
  ) {
  }

  ngAfterViewInit() {
    // ExpressionChangedAfterItHasBeenCheckedError avoidance because this is ngAfterViewInit
    setTimeout(() => {
      this._canvas = this._canvasContainerRef.nativeElement.firstElementChild as SVGSVGElement;
      this._canvasRect = this._canvas.getBoundingClientRect();
      // 12.5% each
      this.spacingBetweenColumns = this._canvasRect.width * 12.5 / 100;
      // 25% each
      this.columnWidth = this._canvasRect.width * 25 / 100;
      this.columnHeight = this._canvasRect.height;
      this._canvasInitialHeight = this._canvasRect.height;
      this._changeDetector.markForCheck();
    }, 1000);
  }

  ngOnInit() {
    this._columnLayoutChange.observe()
      .subscribe(layoutChange => this._onColumnLayoutChanged(layoutChange));

    this._commandService.observe()
      .subscribe((command: Command) => {
        switch (command) {
          case Command.TOGGLE_SHOW_ASSOCIATIONS:
            this._toggleAssociationsForSelectedComponents(!this.showAssociations);
            break;
          case Command.GROUP_CELLS:
            this._groupSelectedCells();
            break;
          case Command.UNGROUP_CELLS:
            this._ungroupSelectedCells();
            break;
          case Command.SHOW_MATRICES:
            this._showMatrices();
            break;
          case Command.TURN_CELL_ON:
            this._turnCellsOnOrOff(true);
            break;
          case Command.TURN_CELL_OFF:
            this._turnCellsOnOrOff(false);
            break;
        }
      });
  }

  private _toggleAssociationsForSelectedComponents(state: boolean) {
    this.showAssociations = state;
    this._changeDetector.detectChanges();
  }

  private _groupSelectedCells() {
    const cellsToGroup = this.selectedCells.filter(cell => cell.column === 'element');
    if (cellsToGroup.length > 0) {
      const newGroup = new CellGroup(true, 0, 0, this.columnWidth, 0);
      for (const elementCell of cellsToGroup) {
        elementCell.cellGroup.removeCell(elementCell);
        this._removeNonDefaultCellGroupIfEmpty(elementCell.cellGroup);
        newGroup.addCell(elementCell);
      }
      this._addNewCellGroup(newGroup);
      this._notifyChanges('element');
    }
  }

  private _addNewCellGroup(cellGroup: CellGroup) {
    const defaultGroup = this.cellGroups.element.pop();
    this.cellGroups.element = this.cellGroups.element.concat(cellGroup, defaultGroup);
    this._changeDetector.detectChanges();
  }

  private _ungroupSelectedCells(addToDefaultGroup = true) {
    for (const cellToUngroup of this.selectedCells) {
      cellToUngroup.cellGroup.removeCell(cellToUngroup);
      // Only remove the owning group if it is not the default group and empty
      this._removeNonDefaultCellGroupIfEmpty(cellToUngroup.cellGroup);
      if (addToDefaultGroup)
        this._addToDefaultCellGroup(cellToUngroup);
    }
    this._notifyChanges('element');
  }

  private _removeNonDefaultCellGroupIfEmpty(cellGroup: CellGroup) {
    if (this.cellGroups.element.length > 1 && cellGroup.size() === 0)
      this.cellGroups.element = this.cellGroups.element.filter(group => group !== cellGroup);
  }

  private _showMatrices() {
    const L = zeros(this.columns.property.length, this.columns.element.length) as Matrix;
    const R = zeros(this.columns.quality.length, this.columns.property.length) as Matrix;
    const Dp = matrix(ones(L.size()));
    this.linkTable.forEach(links => {
      for (const link of links) {
        switch (link.source.column) {
          case 'element':
            L.set([link.target.id, link.source.id], 1);
            Dp.set([link.target.id, link.source.id], 0);
            break;
          case 'property':
            R.set([link.target.id, link.source.id], 1);
            break;
        }
      }
    });
    const Dq = multiply(R, L);
    // T = R (L - Dp) – Dq
    const T = subtract(multiply(R, subtract(L, Dp)), Dq) as Matrix;

    this._matDialog.open(MatricesComponent, {
      data: [
        { name: 'L', entries: L.toArray() },
        { name: 'R', entries: R.toArray() },
        { name: 'T', entries: T.toArray() }
      ]
    });
  }

  private _turnCellsOnOrOff(onOrOff: boolean) {
    this.selectedCells.filter(selected => selected.column === 'element')
      .forEach(cell => cell.isOn = onOrOff);
    this._changeDetector.detectChanges();
  }
  private _onColumnLayoutChanged(layoutChange: ColumnLayoutChange) {
    switch (layoutChange.type) {
      case ColumnLayoutChangeType.CELL_ADDED:
      case ColumnLayoutChangeType.CELL_HEIGHT_INCREASED:
        const cells = this.columns[layoutChange.column];
        if (layoutChange.type === ColumnLayoutChangeType.CELL_ADDED) {
          this._expandCanvasIfCellOverflowsColumn(cells[cells.length - 1]);
        }
        this._notifyChanges(layoutChange.type === ColumnLayoutChangeType.CELL_HEIGHT_INCREASED ? layoutChange.column : null);
        break;
      case ColumnLayoutChangeType.CELL_HEIGHT_DECREASED:
        this._shrinkCanvasIfTooMuchEmptyVerticalSpace();
        this._notifyChanges(layoutChange.column);
        break;
    }
    this.selectedCells = this.selectedCells.filter(selected => selected !== layoutChange.trigger);
  }

  private _expandCanvasIfCellOverflowsColumn(cell: Cell) {
    const difference = (cell.top + cell.height) - this._canvasRect.height;
    if (difference > 0) {
      this._canvas.style.height = this._canvasRect.height
        + difference + 5
        + this._canvasContainerRef.nativeElement.scrollTop
        + 'px';
      this._canvasRect = this._canvas.getBoundingClientRect();
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
      const adjustedHeight = Math.max(this._canvasRect.height - (emptyVerticalSpace - 10), this._canvasInitialHeight);
      this._canvas.style.height = adjustedHeight + 'px';
      this.columnHeight = adjustedHeight;
      this._canvasRect = this._canvas.getBoundingClientRect();
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

  @HostListener('window:keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      if (this.selectedCells.length > 0) {
        this._deleteSelectedCells();
        this._ungroupSelectedCells(false);
        this.selectedCells = [];
        setTimeout(() => {
          this._notifyChanges(null);
          this._shrinkCanvasIfTooMuchEmptyVerticalSpace();
        });
      }
      else if (this.selectedLink) {
        this._deleteLink(this.selectedLink);
        this._notifyChanges(null);
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

  private _notifyChanges(column: ColumnId) {
    this.linkTable = new Map<Cell, Link[]>(this.linkTable);
    if (column)
      this.cellGroups[column] = this.cellGroups[column].map(group => group.clone());
    this._changeDetector.detectChanges();
  }

  onLinkSelected(link: Link) {
    this.selectedCells = [];
    this.selectedLink = link;
    this._commandService.select(Command.ACTIVATE_SHOW_ASSOCIATIONS);
  }

  onCellAdded(columnId: ColumnId) {
    const newCell = this._createNewCell(columnId);
    this.columns[columnId] = this.columns[columnId].concat(newCell);
    this._addToDefaultCellGroup(newCell);
    // Wait until the new cell was rendered, then highlight it
    setTimeout(() => {
      this.selectedCells = [newCell];
      this._notifyChanges(columnId);
    }, 0);
  }

  private _addToDefaultCellGroup(cell: Cell) {
    const defaultCellGroup = this.cellGroups[cell.column].pop();
    defaultCellGroup.addCell(cell);
    this.cellGroups[cell.column].push(defaultCellGroup);
    this._changeDetector.detectChanges();
  }

  private _createNewCell(columnId: ColumnId): Cell {
    const id = this.columns[columnId].length
    return {
      id,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      text: 'Double click to add text',
      column: columnId,
      idSelector: `${columnId}-cell-${id}`,
      domInstance: null,
      cellGroup: null,
      isOn: true
    }
  }

  onElementCellClicked(selectionEvent: CellSelectionEvent) {
    this._addToOrRemoveFromSelectedCells(selectionEvent);
    this._activateCellGroupingOrCellUngroupingCommand();
    this._activateTurnOnCellOrTurnOffCellCommand();
    this.selectedLink = null;
  }

  onPropertyCellClicked(selectionEvent: CellSelectionEvent) {
    // Only "element" column can add links to "element" column
    this._addLinksOrAddToOrRemoveFromSelectedCells('element', selectionEvent);
    this._activateCellGroupingOrCellUngroupingCommand();
  }

  onQualityCellClicked(selectionEvent: CellSelectionEvent) {
    // Only "property" column can add links to "property" column
    this._addLinksOrAddToOrRemoveFromSelectedCells('property', selectionEvent);
    this._activateCellGroupingOrCellUngroupingCommand();
  }

  private _activateCellGroupingOrCellUngroupingCommand() {
    if (this.selectedCells.length > 0) {
      if (this.selectedCells.some(cell => !cell.cellGroup.useDefaultSpacing))
        this._commandService.select(Command.ACTIVATE_CELL_GROUPING);
      else
        this._commandService.select(Command.ACTIVATE_CELL_UNGROUPING);
    }
    else
      this._commandService.select(Command.ACTIVATE_CELL_GROUPING);
  }

  private _activateTurnOnCellOrTurnOffCellCommand() {
    if (this.selectedCells.some(selected => !selected.isOn))
      this._commandService.select(Command.ACTIVATE_TURN_ON_CELL);
    else
      this._commandService.select(Command.ACTIVATE_TURN_OFF_CELL);
  }

  private _addLinksOrAddToOrRemoveFromSelectedCells(sourceColumn: 'element' | 'property', event: CellSelectionEvent) {
    switch (event.type) {
      case CellSelectionEventType.NEW_SELECTION:
        if (this.selectedCells.length > 0) {
          const addedLinks = this.selectedCells.map(e => e.column === sourceColumn && this._addNewLink(e, event.cell))
            .filter(added => added);
          if (addedLinks.length > 0)
            this._notifyChanges(null);
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