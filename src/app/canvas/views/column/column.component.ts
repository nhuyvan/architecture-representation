import { Component, Input, ViewEncapsulation, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

import { TooltipService } from '@shared/views/tooltip/tooltip.service';
import { createSvgElement } from '../../utils';
import { CellAdded } from '../../models/CellAddedEvent';
import { Cell } from '../../models/Cell';
import { ColumnLayoutChange } from 'app/canvas/models/ColumnLayoutChange';
import { TextEditorService } from '../text-editor/text-editor.service';

@Component({
  selector: '[column]',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ColumnComponent implements OnChanges, AfterViewInit {

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
  cellDeleted: Cell;

  @Output()
  cellAdded = new EventEmitter<CellAdded>();

  @Output()
  cellClicked = new EventEmitter<Cell>();

  @Output()
  showConnections = new EventEmitter<boolean>();

  @Output()
  layoutChanged = new EventEmitter<ColumnLayoutChange>();

  headerHeight = 100;
  id = 0;
  cellBeingEdited: Cell;

  @ViewChild('column')
  private _columnRef: ElementRef<Cell>;
  private _column: Cell;
  private _cellWidth = 0;
  private _marginLeft = 0;
  private _cells: Map<Cell, ClientRect> = new Map<Cell, ClientRect>();
  private _lastCellInColumn: Cell;
  private readonly _cellDefaultHeight = 50;
  private readonly _minimumSpacingBetweenCells = 5;
  private static _isShowingConnections = false;

  constructor(private _tooltipService: TooltipService, private _textEditorService: TextEditorService) { }

  ngOnChanges(changes: SimpleChanges) {
    if ('width' in changes && changes.width.currentValue) {
      // 90% of width
      this._cellWidth = this.width * 90 / 100;
      // 5% of width
      this._marginLeft = this.width * 5 / 100;
    }
    if ('cellDeleted' in changes && changes.cellDeleted.currentValue) {
      this._column.removeChild(changes.cellDeleted.currentValue);
      this._centerCellsInColumn(true);
    }
  }

  ngAfterViewInit() {
    this._column = this._columnRef.nativeElement;
  }

  showConnectionsForSelectedComponent(event: MouseEvent) {
    event.stopPropagation();
    ColumnComponent._isShowingConnections = !ColumnComponent._isShowingConnections;
    this._tooltipService.hide();
    this.showConnections.emit(ColumnComponent._isShowingConnections);
  }

  shouldShowConnections() {
    return ColumnComponent._isShowingConnections;
  }

  showTextEditor(event: MouseEvent) {
    const target = event.target as SVGElement;
    const classNameOfClickedElement = target.className;
    if (classNameOfClickedElement !== 'icon-container' && classNameOfClickedElement !== 'material-icons') {
      event.stopPropagation();
      this._textEditorService.show(target.parentElement.getBoundingClientRect(), target.parentElement.dataset.text)
        .textAdded(text => this._onTextAdded(text, ((target.parentElement) as any) as Cell));
    }
  }

  private _onTextAdded(text: string, cellBeingEdited: Cell, resetOnClick = false) {
    const { height: cellHeight, width: cellWidth } = this._cells.get(cellBeingEdited);
    const textContainer = this._addTextToCellBeingEdited(text, cellBeingEdited, cellWidth, cellHeight);
    const { height: textContainerHeight } = textContainer.firstElementChild.getBoundingClientRect();
    const adjustedHeight = this._centerTextInCellBeingEdited(cellHeight, cellBeingEdited, textContainerHeight, textContainer);
    if (adjustedHeight !== cellHeight) {
      this._cells.set(cellBeingEdited, cellBeingEdited.getBoundingClientRect());
      this._centerCellsInColumn(true);
      this._notifyLayoutChange(this.height);
    }
    cellBeingEdited.dataset.text = resetOnClick ? '' : text;
    cellBeingEdited = null;
  }

  private _addTextToCellBeingEdited(text: string, cellBeingEdited: Cell, cellWidth: number, cellHeight: number) {
    const foreignObject = cellBeingEdited.querySelector('foreignObject') || document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    if (foreignObject.childElementCount > 0)
      foreignObject.removeChild(foreignObject.firstElementChild)
    foreignObject.setAttribute('x', '0');
    foreignObject.setAttribute('y', '0');
    foreignObject.setAttribute('width', String(cellWidth));
    foreignObject.setAttribute('height', String(cellHeight));
    const textCenterStyle = 'display:flex;justify-content:center;align-items:center;position:relative;white-space:pre;text-align:center';
    foreignObject.innerHTML = `<div style='${textCenterStyle}'>${text}</div>`;
    cellBeingEdited.appendChild(foreignObject);
    return foreignObject;
  }

  private _centerTextInCellBeingEdited(cellHeight: number, cellBeingEdited: Cell, textContainerHeight: number, textContainer: SVGForeignObjectElement) {
    cellHeight += (textContainerHeight - cellHeight) + 10; // padding top and bottom
    cellHeight = Math.max(cellHeight, 50);
    cellBeingEdited.firstElementChild.setAttribute('height', `${cellHeight}`);
    textContainer.setAttribute('height', `${cellHeight}`);
    (textContainer.firstElementChild as HTMLDivElement).style.height = cellHeight + 'px';
    return cellHeight;
  }

  // onTextAdded(addedText: string) {
  //   let textElement = cellBeingEdited.querySelector('text');
  //   if (textElement)
  //     cellBeingEdited.removeChild(textElement);
  //   textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  //   let { top: cellTop, width: cellWidth, height: cellHeight } = cellBeingEdited.getBoundingClientRect();
  //   const texts = addedText.trim()
  //     .split('\n');
  //   texts.forEach((text, i) => {
  //     const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  //     tspan.setAttribute('x', '0');
  //     tspan.setAttribute('y', `${i * 15}`);
  //     tspan.innerHTML = text;
  //     textElement.appendChild(tspan);
  //   })
  //   cellBeingEdited.appendChild(textElement);
  //   const { top: textTop width: textElementWidth, height: textElementHeight } = textElement.getBoundingClientRect();
  //   const heightDifference = Math.abs(textElementHeight - cellHeight)
  //   if (heightDifference < 20) {
  //     cellHeight += heightDifference + 20;
  //     cellBeingEdited.firstElementChild.setAttribute('height', String(cellHeight));
  //   }
  //   const textElementLeft = (cellWidth - textElementWidth) / 2;
  //   const textElementTop = (cellHeight - textElementHeight) / (texts.length + 1) + Math.abs(textTop - cellTop);
  //   textElement.setAttribute('transform', `translate(${textElementLeft}, ${textElementTop})`);
  //   cellBeingEdited.dataset.text = addedText;
  //   cellBeingEdited = null;
  // }

  private _notifyLayoutChange(columnHeight?: number) {
    this.layoutChanged.emit({
      lastCellInColumn: this._lastCellInColumn,
      cellsInColumn: this._cells,
      columnHeight
    });
  }

  addCell(event: MouseEvent) {
    event.stopPropagation();
    this._lastCellInColumn = this._createCell();
    this._column.appendChild(this._lastCellInColumn);
    this._cells.set(this._lastCellInColumn, this._lastCellInColumn.getBoundingClientRect());
    this._centerCellsInColumn();
    this._notifyLayoutChange();
    this.cellAdded.emit({
      id: this.id,
      cell: this._lastCellInColumn
    });
    this.id++;
    this._onTextAdded('Double click to add text', this._lastCellInColumn, true);
  }

  private _createCell(): Cell {
    const cell = createSvgElement(
      'rect',
      {
        stroke: '#000',
        fill: '#fff',
        x: 0,
        y: 0,
        width: this._cellWidth,
        height: this._cellDefaultHeight
      }) as SVGRectElement;
    const cellContainer = createSvgElement(
      'g',
      {
        id: `${this.prefix}-cell-${this.id}`,
        'data-id': this.id,
        'data-column-prefix': this.prefix
      }) as SVGGElement;
    cellContainer.appendChild(cell);
    return cellContainer as Cell;
  }

  private _centerCellsInColumn(shrinkColumn = false) {
    let totalHeightOfAllCells = 0;
    for (const cellGeometry of this._cells.values())
      totalHeightOfAllCells += cellGeometry ? cellGeometry.height : this._cellDefaultHeight;
    const remainingHeight = this.height - this.headerHeight - totalHeightOfAllCells;
    const spacingBetweenCells = Math.max(this._minimumSpacingBetweenCells, remainingHeight / (this._cells.size + 1));
    let topOfCurrentCell = spacingBetweenCells + this.headerHeight;
    this._cells.forEach((cellGeometry, cell) => {
      cell.setAttribute('transform', `translate(${this._marginLeft},${topOfCurrentCell})`);
      topOfCurrentCell += (cellGeometry ? cellGeometry.height : this._cellDefaultHeight) + spacingBetweenCells;
      this._cells.set(cell, cell.getBoundingClientRect());
    });
  }

  private _shrinkColumnIfTooTall(totalHeightOfAllCells: number) {
    const minimumColumnHeight = totalHeightOfAllCells
      + this.headerHeight
      + this._minimumSpacingBetweenCells * (this._cells.size + 1);
    this.height = Math.min(this.height, minimumColumnHeight);
  }

  onCellClicked(event: MouseEvent) {
    const target = event.target as SVGRectElement;
    this.cellClicked.emit(this._toggleHighlightCell(target.parentElement as any));
  }

  private _toggleHighlightCell(cell: Cell): Cell {
    for (const hightlightedCell of Array.from(document.querySelectorAll('svg g[data-selected]')))
      if (cell !== hightlightedCell)
        hightlightedCell.removeAttribute('data-selected');

    if (cell.dataset.selected === 'selected') {
      cell.removeAttribute('data-selected');
      ColumnComponent._isShowingConnections = false;
      this.showConnections.emit(false);
      return null;
    }
    else {
      cell.dataset.selected = 'selected';
      return cell;
    }
  }

}
