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
  existingLinks: Link[];

  constructor(@Host() private _canvas: ElementRef<SVGElement>) { }

  ngOnChanges(changes: SimpleChanges) {
    if ('selectedCell' in changes) {
      if (changes.selectedCell.currentValue) {
        this._highlightCell(changes.selectedCell.currentValue);
        if (this.existingLinks)
          for (const link of this.existingLinks)
            if ([link.source, link.target].includes(changes.selectedCell.currentValue)) {
              this._highlightCell(link.source);
              this._highlightCell(link.target);
              this._highlightLink(link);
            }
      }
      else if (changes.selectedCell.previousValue) {
        this._unhighlightCell(changes.selectedCell.previousValue);
        if (this.existingLinks)
          for (const link of this.existingLinks)
            if ([link.source, link.target].includes(changes.selectedCell.previousValue)) {
              this._unhighlightCell(link.source);
              this._unhighlightCell(link.target);
              this._unhighlightLink(link);
            }
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
