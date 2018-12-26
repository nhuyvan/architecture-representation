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
  existingLinks: Map<Cell, Link[]>;

  constructor(@Host() private _canvas: ElementRef<SVGElement>) { }

  ngOnChanges(changes: SimpleChanges) {
    if ('selectedCell' in changes) {
      if (changes.selectedCell.currentValue) {
        this._highlightCell(changes.selectedCell.currentValue);
        if (this.existingLinks)
          this.existingLinks.forEach(links => {
            for (const link of links)
              if ([link.source, link.target].includes(changes.selectedCell.currentValue)) {
                this._highlightCell(link.source);
                this._highlightCell(link.target);
                this._highlightLink(link);
              }
          });
      }
      else if (changes.selectedCell.previousValue) {
        this._unhighlightCell(changes.selectedCell.previousValue);
        if (this.existingLinks)
          this.existingLinks.forEach(links => {
            for (const link of links)
              if ([link.source, link.target].includes(changes.selectedCell.previousValue)) {
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

  private _highlightCell(cell: Cell) {
    this._canvas.nativeElement.classList.add('highlighting');
    cell.style.strokeOpacity = '1';
    cell.querySelector('foreignObject').style.opacity = '1';
  }

  private _unhighlightCell(cell: Cell) {
    this._canvas.nativeElement.classList.remove('highlighting');
    cell.style.strokeOpacity = null;
    cell.querySelector('foreignObject').style.opacity = null;
  }

  private _highlightLink(link: Link) {
    this._canvas.nativeElement.classList.add('highlighting');
    const linkElement = this._canvas.nativeElement.querySelector(`#${link.source.id}_${link.target.id}`) as SVGElement;
    linkElement.style.strokeOpacity = '1';
  }

  private _unhighlightLink(link: Link) {
    this._canvas.nativeElement.classList.remove('highlighting');
    const linkElement = this._canvas.nativeElement.querySelector(`#${link.source.id}_${link.target.id}`) as SVGElement;
    linkElement.style.strokeOpacity = null;
  }
}
