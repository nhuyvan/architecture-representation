import { Component, Input, ViewEncapsulation, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

import { TooltipService } from '@shared/views/tooltip/tooltip.service';
import { createSvgElement } from '../../utils';
import { Cell } from '../../models/Cell';
import { ColumnLayoutChange, ColumnLayoutChangeType } from '../../models/ColumnLayoutChange';
import { TextEditorService } from '../text-editor/text-editor.service';
import { ColumnId } from '../../models/Column';

@Component({
  selector: '[column]',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ColumnComponent implements OnChanges, AfterViewInit {

  @Input()
  cells: Cell[] = [];

  @Input()
  prefix: 'element' | 'property' | 'quality';

  @Input()
  width: number;

  @Input()
  height: number;

  @Input()
  left = 0;

  @Input()
  header = '';

  @Input()
  headerTitleColor = '';

  @Input()
  deletedCell: Cell;

  @Output()
  cellAdded = new EventEmitter<Cell>();

  @Output()
  cellClicked = new EventEmitter<Cell>();

  @Output()
  showAssociationsToggled = new EventEmitter<boolean>();

  @Output()
  layoutChanged = new EventEmitter<ColumnLayoutChange>();

  readonly headerHeight = 100;

  @ViewChild('column')
  private _columnRef: ElementRef<SVGGElement>;
  private _column: SVGGElement;
  private _cellWidth = 0;
  private _marginLeft = 0;
  private readonly _defaultCellHeight = 50;
  private readonly _minimumSpacingBetweenCells = 5;
  private static _isShowingAssociations = false;

  constructor(private _tooltipService: TooltipService, private _textEditorService: TextEditorService) { }

  ngOnChanges(changes: SimpleChanges) {
    if ('width' in changes && changes.width.currentValue) {
      // 90% of width
      this._cellWidth = this.width * 90 / 100;
      // 5% of width
      this._marginLeft = this.width * 5 / 100;
    }
    if ('deletedCell' in changes && !changes.deletedCell.firstChange) {
      this._column.removeChild(this.deletedCell.domInstance);
      if (this.cells.length > 0) {
        this._adjustIdsOfCellDomInstancesAfterDeletedCell(this.deletedCell);
        this._centerCellsInColumn(this.cells);
        this._notifyLayoutChange(this.deletedCell.column, ColumnLayoutChangeType.CELL_REMOVED);
      }
      this.deletedCell = null;
    }

    if ('height' in changes && changes.height.currentValue) {
      this._centerCellsInColumn(this.cells);
    }

    if ('cells' in changes && !changes.cells.firstChange && this.cells.length > 0) {
      this._centerCellsInColumn(this.cells);
      this._notifyLayoutChange(this.cells[0].column, ColumnLayoutChangeType.CELL_ADDED);
    }
  }

  private _adjustIdsOfCellDomInstancesAfterDeletedCell(deletedCell: Cell) {
    for (let i = deletedCell.id; i < this.cells.length; i++) {
      this.cells[i].domInstance.setAttribute('data-id', String(i));
      this.cells[i].domInstance.id = this.cells[i].idSelector;
    }
  }

  ngAfterViewInit() {
    this._column = this._columnRef.nativeElement;
  }

  showAssociationsForSelectedComponent(event: MouseEvent) {
    event.stopPropagation();
    ColumnComponent._isShowingAssociations = !ColumnComponent._isShowingAssociations;
    this._tooltipService.hide();
    this.showAssociationsToggled.emit(ColumnComponent._isShowingAssociations);
  }

  shouldShowAssociations() {
    return ColumnComponent._isShowingAssociations;
  }

  showTextEditor(target: HTMLElement | SVGGElement) {
    if (target.hasAttribute('data-cell')) {
      event.stopPropagation();
      this._textEditorService.show(this.cells[+target.dataset.id])
        .textAdded((text, cellBeingEdited) => this._onTextAdded(text, cellBeingEdited));
    }
  }

  private _onTextAdded(text: string, cellBeingEdited: Cell, resetOnClick = false) {
    const textContainer = this._addTextToCellBeingEdited(text, cellBeingEdited);
    const { height: textContainerHeight } = textContainer.firstElementChild.getBoundingClientRect();
    const adjustedHeight = this._centerTextInCellBeingEdited(cellBeingEdited, textContainerHeight, textContainer);
    const heightDifference = adjustedHeight - cellBeingEdited.height;
    if (heightDifference !== 0) {
      cellBeingEdited.height = adjustedHeight;
      this._centerCellsInColumn(this.cells);
      this._notifyLayoutChange(
        cellBeingEdited.column,
        heightDifference < 0 ? ColumnLayoutChangeType.CELL_HEIGHT_DECREASED : ColumnLayoutChangeType.CELL_HEIGHT_INCREASED
      );
    }
    else
      this._notifyLayoutChange(cellBeingEdited.column, ColumnLayoutChangeType.CELL_HEIGHT_UNCHANGED);

    cellBeingEdited.text = resetOnClick ? '' : text;
    cellBeingEdited.domInstance.removeAttribute('data-selected');
  }

  private _addTextToCellBeingEdited(text: string, cellBeingEdited: Cell) {
    const foreignObject = cellBeingEdited.domInstance.querySelector('foreignObject')
      || document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    if (foreignObject.childElementCount > 0)
      foreignObject.removeChild(foreignObject.firstElementChild)
    foreignObject.setAttribute('x', '0');
    foreignObject.setAttribute('y', '0');
    foreignObject.setAttribute('width', String(cellBeingEdited.width));
    foreignObject.setAttribute('height', String(cellBeingEdited.height));
    const textCenterStyle = 'display:flex;justify-content:center;align-items:center;position:relative;white-space:pre;text-align:center';
    foreignObject.innerHTML = `<div style='${textCenterStyle}'>${text}</div>`;
    cellBeingEdited.domInstance.appendChild(foreignObject);
    return foreignObject;
  }

  private _centerTextInCellBeingEdited(cellBeingEdited: Cell, textContainerHeight: number, textContainer: SVGForeignObjectElement) {
    // +10 padding top and bottom
    const adjustedHeight = Math.max(cellBeingEdited.height + (textContainerHeight - cellBeingEdited.height) + 10, 50);
    cellBeingEdited.domInstance.firstElementChild.setAttribute('height', `${adjustedHeight}`);
    textContainer.setAttribute('height', `${adjustedHeight}`);
    (textContainer.firstElementChild as HTMLDivElement).style.height = adjustedHeight + 'px';
    return adjustedHeight;
  }

  private _notifyLayoutChange(columnId: ColumnId, type: ColumnLayoutChangeType) {
    this.layoutChanged.emit({ column: columnId, type });
  }

  addCell() {
    const cell = this._createNewCell();
    this._renderCell(cell);
    this.cellAdded.emit(cell);
    this._onTextAdded(cell.text, cell, true);
  }

  private _createNewCell(): Cell {
    return {
      id: this.cells.length,
      left: this._marginLeft + this.left,
      top: 0,
      width: this._cellWidth,
      height: this._defaultCellHeight,
      text: 'Double click to add text',
      column: this.prefix,
      idSelector: `${this.prefix}-cell-${this.cells.length}`,
      domInstance: null
    }
  }

  private _renderCell(cell: Cell) {
    const cellElement = createSvgElement(
      'rect',
      {
        x: 0,
        y: 0,
        width: cell.width,
        height: cell.height
      }) as SVGRectElement;
    const cellContainer = createSvgElement(
      'g',
      {
        id: cell.idSelector,
        'data-id': cell.id,
        'data-column-prefix': cell.column,
        'data-cell': 'true',
        transform: `translate(${this._marginLeft}, ${this.height})`,
        class: 'cell',
        stroke: '#000',
        fill: '#fff',
      }) as SVGGElement;
    cellContainer.appendChild(cellElement);
    this._column.appendChild(cellContainer);
    cell.domInstance = cellContainer;
  }

  private _centerCellsInColumn(cells: Cell[]) {
    const totalHeightOfAllCells = cells.reduce((sum, cell) => sum + cell.height, 0);
    const remainingHeight = this.height - this.headerHeight - totalHeightOfAllCells;
    const spacingBetweenCells = Math.max(this._minimumSpacingBetweenCells, remainingHeight / (cells.length + 1));
    let topOfCurrentCell = spacingBetweenCells + this.headerHeight;
    for (const cell of cells) {
      this._repositionCellVertically(cell, topOfCurrentCell);
      topOfCurrentCell += cell.height + spacingBetweenCells;
    }
  }

  private _repositionCellVertically(cell: Cell, newTop: number) {
    cell.domInstance.setAttribute('transform', `translate(${this._marginLeft},${newTop})`);
    cell.top = newTop;
  }

  onCellClicked(target: HTMLElement | SVGElement) {
    if (target.hasAttribute('data-cell')) {
      const cell = this.cells[+target.dataset.id];
      ColumnComponent._isShowingAssociations = false;
      this.cellClicked.emit(cell.domInstance.hasAttribute('data-selected') ? null : cell);
    }
  }

}