import { Directive, Input, OnChanges, Host, ElementRef, SimpleChanges, IterableDiffer, IterableDiffers } from '@angular/core';

import { Link } from '../models/Link';
import { Cell } from '../models/Cell';

@Directive({
  selector: '[highlighter]'
})
export class HighlighterDirective implements OnChanges {

  @Input()
  selectedLink: Link;

  @Input()
  selectedCells: Cell[] = [];

  @Input()
  linkTable: Map<Cell, Array<Link>>;

  @Input()
  showAssociations = false;

  private _cellArrayDiffer: IterableDiffer<Cell>;

  constructor(@Host() private _canvas: ElementRef<SVGElement>, diffs: IterableDiffers) {
    this._cellArrayDiffer = diffs.find(this.selectedCells).create();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('selectedCells' in changes && !changes.selectedCells.firstChange) {
      this.selectedCells.forEach(selectedCell => this._selectCell(selectedCell));
      const changes = this._cellArrayDiffer.diff(this.selectedCells);
      if (changes)
        changes.forEachRemovedItem(changeRecord => this._deselectCell(changeRecord.item));
    }

    if ('selectedLink' in changes) {
      if (changes.selectedLink.currentValue)
        this._selectLink(changes.selectedLink.currentValue);
      else if (changes.selectedLink.previousValue)
        this._deselectLink(changes.selectedLink.previousValue);
    }

    if ('showAssociations' in changes) {
      if (changes.showAssociations.currentValue) {
        if (this.selectedCells)
          this.selectedCells.forEach(selectedCell => this._highlightCellAndItsAssociations(selectedCell));
        else if (this.selectedLink) {
          this._highlightCell(this.selectedLink.source);
          this._highlightCell(this.selectedLink.target);
        }
      }
      else {
        if (this.selectedCells)
          this.selectedCells.forEach(selectedCell => this._unhighlightCellAndItsAssociations(selectedCell));
        else if (this.selectedLink) {
          this._unhighlightCell(this.selectedLink.source);
          this._unhighlightCell(this.selectedLink.target);
        }
      }
    }
  }

  private _highlightCellAndItsAssociations(cell: Cell) {
    this._highlightCell(cell);
    this._forEachLink(link => {
      if (link.source === cell || link.target === cell) {
        this._highlightCell(link.source);
        this._highlightCell(link.target);
        this._highlightLink(link);
      }
    });
  }

  private _unhighlightCellAndItsAssociations(cell: Cell) {
    this._unhighlightCell(cell);
    this._forEachLink(link => {
      if (link.source === cell || link.target === cell) {
        this._unhighlightCell(link.source);
        this._unhighlightCell(link.target);
        this._unhighlightLink(link);
      }
    });
  }
  private _forEachLink(action: (link: Link) => void) {
    if (this.linkTable)
      this.linkTable.forEach(links => {
        for (const link of links)
          action(link);
      });
  }

  private _selectCell(cell: Cell) {
    cell.domInstance.setAttribute('data-selected', '');
  }

  private _deselectCell(cell: Cell) {
    cell.domInstance.removeAttribute('data-selected');
  }

  private _selectLink(link: Link) {
    this._deselectPreviousSelectedElements(link);
    link.domInstance.setAttribute('data-selected', '');
  }

  private _deselectLink(link: Link) {
    link.domInstance.removeAttribute('data-selected');
  }

  private _deselectPreviousSelectedElements(item: Cell | Link) {
    document.querySelectorAll('svg g[data-selected]')
      .forEach(previousSelectedElement => {
        if (item.idSelector !== previousSelectedElement.id)
          previousSelectedElement.removeAttribute('data-selected');
      });
  }

  private _highlightCell(cell: Cell) {
    this._canvas.nativeElement.classList.add('highlighting');
    cell.domInstance.setAttribute('data-highlighted', '');
  }

  private _unhighlightCell(cell: Cell) {
    this._canvas.nativeElement.classList.remove('highlighting');
    cell.domInstance.removeAttribute('data-highlighted');
  }

  private _highlightLink(link: Link) {
    this._canvas.nativeElement.classList.add('highlighting');
    link.domInstance.setAttribute('data-highlighted', '');
  }

  private _unhighlightLink(link: Link) {
    this._canvas.nativeElement.classList.remove('highlighting');
    link.domInstance.removeAttribute('data-highlighted');
  }

}
