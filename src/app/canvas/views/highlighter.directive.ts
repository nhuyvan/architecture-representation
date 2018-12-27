import { Directive, Input, OnChanges, Host, ElementRef, SimpleChanges } from '@angular/core';

import { Link } from '../models/Link';
import { Cell } from '../models/Cell';

@Directive({
  selector: '[highlighter]'
})
export class HighlighterDirective implements OnChanges {

  @Input()
  selectedLink: Link;

  @Input()
  selectedCell: Cell;

  @Input()
  linkTable: { [sourceCellSelector: string]: Link[] };

  constructor(@Host() private _canvas: ElementRef<SVGElement>) { }

  ngOnChanges(changes: SimpleChanges) {
    // Highlight/unhighlight the selected cell, and all the links coming out of it
    // or into it, and also directly or indirectly linked cells to the selected cell
    if ('selectedCell' in changes) {
      if (this.selectedCell) {
        this._highlightCell(this.selectedCell);
        this._forEachLink(link => {
          if (link.source === this.selectedCell || link.target === this.selectedCell) {
            this._highlightCell(link.source);
            this._highlightCell(link.target);
            this._highlightLink(link);
          }
        });
      }
      else if (changes.selectedCell.previousValue) {
        const previousCell = changes.selectedCell.previousValue;
        this._unhighlightCell(previousCell);
        this._forEachLink(link => {
          if (link.source === previousCell || link.target === previousCell) {
            this._unhighlightCell(link.source);
            this._unhighlightCell(link.target);
            this._unhighlightLink(link);
          }
        });
      }
    }

    if ('selectedLink' in changes) {
      if (changes.selectedLink.currentValue) {
        this._highlightCell(changes.selectedLink.currentValue.source);
        this._highlightCell(changes.selectedLink.currentValue.target);
        this._highlightLink(changes.selectedLink.currentValue);
      }
      else if (changes.selectedLink.previousValue) {
        this._unhighlightCell(changes.selectedLink.previousValue.source);
        this._unhighlightCell(changes.selectedLink.previousValue.target);
        this._unhighlightLink(changes.selectedLink.previousValue);
      }
    }
  }

  private _forEachLink(action: (link: Link) => void) {
    if (this.linkTable)
      for (const sourceCellSelector in this.linkTable)
        for (const link of this.linkTable[sourceCellSelector])
          action(link);
  }

  private _highlightCell(cell: Cell) {
    this._canvas.nativeElement.classList.add('highlighting');
    const cellDomElement = document.querySelector(`svg #${cell.idSelector}`) as SVGGElement;
    cellDomElement.setAttribute('data-highlighted', '');
  }

  private _unhighlightCell(cell: Cell) {
    this._canvas.nativeElement.classList.remove('highlighting');
    const cellDomElement = document.querySelector(`svg #${cell.idSelector}`) as SVGGElement;
    cellDomElement.removeAttribute('data-highlighted');
  }

  private _highlightLink(link: Link) {
    this._canvas.nativeElement.classList.add('highlighting');
    this._canvas.nativeElement.querySelector(`#${link.source.idSelector}_${link.target.idSelector}`).setAttribute('data-highlighted', '');
  }

  private _unhighlightLink(link: Link) {
    this._canvas.nativeElement.classList.remove('highlighting');
    this._canvas.nativeElement.querySelector(`#${link.source.idSelector}_${link.target.idSelector}`).removeAttribute('data-highlighted');
  }

}
