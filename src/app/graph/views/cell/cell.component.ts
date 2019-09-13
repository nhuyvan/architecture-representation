import { Component, Input, ElementRef, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';

import { Cell } from '../../models/Cell';
import { TextEditorService } from '../text-editor/text-editor.service';
import { ColumnLayoutChangeService } from '../../services/column-layout-change.service';
import { ColumnLayoutChangeType } from '../../models/ColumnLayoutChange';
import { GraphModelChangeService } from '../../services/graph-model-change.service';
import { GraphModelChangeType } from '../../models/GraphModelChangeType';

@Component({
  selector: 'g[cell]',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CellComponent implements AfterViewInit {

  private static _indexToBreakTextAt = -1;
  private static readonly _PADDING_LEFT_RIGHT = 10;
  private static readonly _PADDING_TOP_BOTTOM = 10;

  @Input()
  cell: Cell;

  height = 0;

  @ViewChild('cellElement', { static: true })
  private _cellElementRef: ElementRef<SVGGElement>;

  constructor(
    private _textEditorService: TextEditorService,
    private _columnLayoutChange: ColumnLayoutChangeService,
    private _graphModelChangeService: GraphModelChangeService) {

  }

  ngAfterViewInit() {
    this.cell.domInstance = this._cellElementRef.nativeElement;
    this.height = this.cell.height;
    (this._cellElementRef.nativeElement as any).__cell__ = this.cell;
    if (CellComponent._indexToBreakTextAt === -1)
      CellComponent._indexToBreakTextAt = this._findIndexToBreakTextAt();
    if (CellComponent._indexToBreakTextAt < this.cell.text.length)
      setTimeout(() => {
        // Only get the larger height
        this.height = Math.max(this.cell.domInstance.querySelector('.cell__text__container').scrollHeight, this.height);
        this.cell.height = this.height;
        this._columnLayoutChange.notify(ColumnLayoutChangeType.CELL_HEIGHT_INCREASED, this.cell);
      }, 0);
  }

  private _findIndexToBreakTextAt() {
    let longText = '';
    const textElement = this.cell.domInstance.querySelector('.cell__text__container')
      .cloneNode(true) as HTMLDivElement;
    textElement.style.position = 'fixed';
    textElement.textContent = '';
    document.body.appendChild(textElement);
    while (textElement.scrollWidth - CellComponent._PADDING_LEFT_RIGHT < this.cell.width) {
      longText += 'a';
      textElement.textContent = longText;
    }
    document.body.removeChild(textElement);
    return longText.length - 1;
  }

  showEditorToAddWeightForQualityCell(isCell: boolean, event: MouseEvent) {
    if ((event.ctrlKey || event.metaKey) && isCell && this.cell.column === 'quality') {
      event.stopPropagation();
      this._textEditorService.show(this.cell, String(this.cell.weight))
        .textAdded((payload, cellBeingEdited) => {
          const weight = +payload.text;
          if (weight >= 0 && weight !== cellBeingEdited.weight) {
            this._updateWeightValueForCell(weight);
            this._graphModelChangeService.notify(
              GraphModelChangeType.QUALITY_WEIGHT_UPDATED,
              { cell: cellBeingEdited, weight }
            );
          }
        });
    }
  }

  private _updateWeightValueForCell(weight: number) {
    this.cell.domInstance.querySelector('.cell__weight').textContent = String(weight);
  }

  showTextEditor(isCell: boolean, event: MouseEvent) {
    if (isCell) {
      event.stopPropagation();
      this._textEditorService.show(this.cell, this.cell.text)
        .textAdded((payload, cellBeingEdited) =>
          this._onTextAdded(payload, cellBeingEdited));
    }
  }

  private _onTextAdded(payload: { text: string, textContainerHeight: number }, cellBeingEdited: Cell) {
    if (payload.text !== cellBeingEdited.text) {
      this._addTextToCellBeingEdited(payload.text, cellBeingEdited);
      const heightDifference = payload.textContainerHeight - cellBeingEdited.height;
      if (heightDifference !== 0) {
        cellBeingEdited.height = Math.max(payload.textContainerHeight + CellComponent._PADDING_TOP_BOTTOM, 50);
        this.height = cellBeingEdited.height;
        this._columnLayoutChange.notify(
          heightDifference < 0 ? ColumnLayoutChangeType.CELL_HEIGHT_DECREASED : ColumnLayoutChangeType.CELL_HEIGHT_INCREASED,
          cellBeingEdited
        );
      }
      cellBeingEdited.domInstance.removeAttribute('data-selected');
      this._graphModelChangeService.notify(
        GraphModelChangeType.CELL_TEXT_UPDATED,
        { cell: cellBeingEdited, text: payload.text }
      );
    }
  }

  private _addTextToCellBeingEdited(text: string, cellBeingEdited: Cell) {
    const foreignObject = cellBeingEdited.domInstance.querySelector('foreignObject');
    foreignObject.setAttribute('x', '0');
    foreignObject.setAttribute('y', '0');
    foreignObject.setAttribute('width', String(cellBeingEdited.width));
    foreignObject.setAttribute('height', String(cellBeingEdited.height));
    foreignObject.firstElementChild.textContent = text;
  }

}
