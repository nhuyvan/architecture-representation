import { Component, Input, ViewEncapsulation, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, IterableDiffer, IterableDiffers } from '@angular/core';

import { TooltipService } from '@shared/views/tooltip/tooltip.service';
import { createSvgElement } from '../../utils';
import { Cell } from '../../models/Cell';
import { ColumnLayoutChange, ColumnLayoutChangeType } from '../../models/ColumnLayoutChange';
import { TextEditorService } from '../text-editor/text-editor.service';
import { ColumnId } from '../../models/Column';
import { CellSelectionEvent, CellSelectionEventType } from 'app/canvas/models/CellSelectionEvent';

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

  @Output()
  cellAdded = new EventEmitter<ColumnId>();

  @Output()
  cellClicked = new EventEmitter<CellSelectionEvent>();

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
  private _cellArrayDiffer: IterableDiffer<Cell>;

  constructor(
    private _tooltipService: TooltipService,
    private _textEditorService: TextEditorService,
    differs: IterableDiffers
  ) {
    this._cellArrayDiffer = differs.find(this.cells).create();
  }

  ngAfterViewInit() {
    this._column = this._columnRef.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('width' in changes && changes.width.currentValue) {
      // 90% of width
      this._cellWidth = this.width * 90 / 100;
      // 5% of width
      this._marginLeft = this.width * 5 / 100;
    }

    if ('height' in changes && changes.height.currentValue)
      this._centerCellsInColumn();

    if ('cells' in changes && !changes.cells.firstChange) {
      const diffResult = this._cellArrayDiffer.diff(this.cells);
      if (this.cells.length < changes.cells.previousValue.length) {
        diffResult.forEachRemovedItem(change => this._column.removeChild(change.item.domInstance));
        this._readjustCellDomInstanceIds();
        this._centerCellsInColumn();
      }
      else {
        this._renderCell(this.cells[this.cells.length - 1]);
        this._centerCellsInColumn();
        this._notifyLayoutChange(this.prefix, ColumnLayoutChangeType.CELL_ADDED, null);
      }
    }
  }

  private _readjustCellDomInstanceIds() {
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      cell.domInstance.id = cell.idSelector;
      cell.domInstance.setAttribute('data-id', String(cell.id));
    }

  }

  private _centerCellsInColumn() {
    const spacingBetweenCells = this._calculateSpacingBetweenCells();
    let topOfCurrentCell = this.headerHeight + spacingBetweenCells;
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      this._repositionCellVertically(cell, topOfCurrentCell);
      topOfCurrentCell += cell.height + spacingBetweenCells;
      cell.domInstance.id = cell.idSelector;
      cell.domInstance.setAttribute('data-id', String(cell.id));
    }
  }

  private _calculateSpacingBetweenCells() {
    const totalHeightOfAllCells = this.cells.reduce((sum, cell) => sum + cell.height, 0);
    const remainingHeight = this.height - this.headerHeight - totalHeightOfAllCells;
    return Math.max(this._minimumSpacingBetweenCells, remainingHeight / (this.cells.length + 1));
  }

  private _renderCell(cell: Cell) {
    if (!cell.domInstance) {
      cell.left = this._marginLeft + this.left;
      cell.top = 0;
      cell.width = this._cellWidth;
      cell.height = this._defaultCellHeight;
      const rectElement = createSvgElement(
        'rect',
        {
          x: 0,
          y: 0,
          width: cell.width,
          height: cell.height
        }) as SVGRectElement;
      const cellElement = createSvgElement(
        'g',
        {
          id: cell.idSelector,
          'data-id': cell.id,
          'data-cell': 'true',
          transform: `translate(${this._marginLeft}, ${this.height})`,
          class: 'cell',
          stroke: '#000',
          fill: '#fff',
        }) as SVGGElement;
      cellElement.appendChild(rectElement);
      cell.domInstance = cellElement;
      this._onTextAdded(cell.text, cell, true);
    }
    else {
      cell.domInstance.id = cell.idSelector;
      cell.domInstance.setAttribute('data-id', String(cell.id));
    }
    this._column.appendChild(cell.domInstance);
  }

  private _repositionCellVertically(cell: Cell, newTop: number) {
    cell.domInstance.setAttribute('transform', `translate(${this._marginLeft},${newTop})`);
    cell.top = newTop;
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
      this._centerCellsInColumn();
      this._notifyLayoutChange(
        cellBeingEdited.column,
        heightDifference < 0 ? ColumnLayoutChangeType.CELL_HEIGHT_DECREASED : ColumnLayoutChangeType.CELL_HEIGHT_INCREASED,
        cellBeingEdited
      );
    }
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

  private _notifyLayoutChange(columnId: ColumnId, type: ColumnLayoutChangeType, cell: Cell) {
    this.layoutChanged.emit({ column: columnId, type, trigger: cell });
  }

  addCell() {
    this.cellAdded.emit(this.prefix);
  }

  onCellClicked(target: HTMLElement | SVGElement, event: MouseEvent) {
    if (target.hasAttribute('data-cell')) {
      const cell = this.cells[+target.dataset.id];
      ColumnComponent._isShowingAssociations = false;
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