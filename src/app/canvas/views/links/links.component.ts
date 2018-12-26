import { Component, ViewChild, ElementRef, Input, OnChanges, ViewEncapsulation, Output, EventEmitter, AfterViewInit } from '@angular/core';

import { createSvgElement } from '../../utils';
import { Link } from '../../models/Link';
import { Column } from 'app/canvas/models/Column';
import { Cell } from '../../models/Cell';

@Component({
  selector: '[links]',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LinksComponent implements OnChanges, AfterViewInit {

  @Input()
  links: Map<Cell, Link[]>;

  @Input()
  columns: Column;

  @Output()
  linkSelected = new EventEmitter<Link>();

  @ViewChild('links')
  private _linksRef: ElementRef<SVGGElement>;
  private _wrapper: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  constructor() {
  }

  ngAfterViewInit() {
    this._linksRef.nativeElement.appendChild(this._wrapper);
  }

  ngOnChanges() {
    if (this._linksRef && this.links && this.columns) {
      this._linksRef.nativeElement.removeChild(this._wrapper);
      this._wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.links.forEach(links => {
        for (const link of links) {
          this._drawLink(link);
          this._unhighlightCell(link.source);
          this._unhighlightCell(link.target);
        }
      });
      this._linksRef.nativeElement.appendChild(this._wrapper);
    }
  }

  selectLink(event: MouseEvent) {
    const clickedLink = (event.target as SVGElement).parentElement;
    const selectedItems = document.querySelectorAll('svg g[data-selected]');
    selectedItems.forEach(item => {
      if (item !== clickedLink)
        item.removeAttribute('data-selected');
    });
    if (clickedLink.hasAttribute('data-selected')) {
      clickedLink.removeAttribute('data-selected');
      this.linkSelected.emit(null);
    }
    else {
      clickedLink.setAttribute('data-selected', 'selected');
      this.linkSelected.emit((clickedLink as any).__link__);
    }

  }

  private _drawLink(link: Link) {
    const source = this._findCellInColumn(link.source);
    const target = this._findCellInColumn(link.target);
    const y1 = source.top + source.height / 2;
    const y2 = target.top + target.height / 2;
    const line = createSvgElement('line', {
      x1: source.left + source.width,
      y1,
      x2: target.left,
      y2,
      stroke: '#000',
      'stroke-width': '1px',
      class: 'link'
    });
    const lineHoverSelectionHandle = createSvgElement('line', {
      x1: source.left + source.width,
      y1,
      x2: target.left,
      y2,
      stroke: 'transparent',
      'stroke-width': '10px',
      class: 'link-selection-handle'
    });
    const container = createSvgElement('g', { id: `${link.source.id}_${link.target.id}` }, { __link__: link });
    container.appendChild(line);
    container.appendChild(lineHoverSelectionHandle);
    this._wrapper.appendChild(container);
  }

  private _findCellInColumn(cell: Cell): ClientRect {
    return this.columns[cell.dataset.columnPrefix].get(cell);
  }

  private _unhighlightCell(cell: SVGElement) {
    cell.removeAttribute('data-selected');
  }

}