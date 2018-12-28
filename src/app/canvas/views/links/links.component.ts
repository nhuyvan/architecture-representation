import { Component, ViewChild, ElementRef, Input, OnChanges, ViewEncapsulation, Output, EventEmitter, AfterViewInit } from '@angular/core';

import { createSvgElement } from '../../utils';
import { Link } from '../../models/Link';
import { Column } from '../../models/Column';
import { ColorService } from '../../services/color.service';

@Component({
  selector: '[links]',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LinksComponent implements OnChanges, AfterViewInit {

  @Input()
  linkTable: { [sourceCellId: string]: Array<Link> } = {};

  @Input()
  columns: Column;

  @Output()
  linkSelected = new EventEmitter<Link>();

  @ViewChild('links')
  private _linksRef: ElementRef<SVGGElement>;
  private _wrapper: SVGElement;

  constructor(private _colorService: ColorService) {
  }

  ngAfterViewInit() {
    this._wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this._linksRef.nativeElement.appendChild(this._wrapper);
  }

  ngOnChanges() {
    if (this._linksRef && this.linkTable && this.columns && this._wrapper) {
      this._linksRef.nativeElement.removeChild(this._wrapper);
      this._wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      for (const sourceCellSelector in this.linkTable)
        for (const link of this.linkTable[sourceCellSelector])
          this._renderLink(link);
      this._linksRef.nativeElement.appendChild(this._wrapper);
    }
  }

  selectLink(event: MouseEvent) {
    const clickedLink = (event.target as SVGElement).parentElement;
    this.linkSelected.emit(clickedLink.hasAttribute('data-selected') ? null : (clickedLink as any).__link__);
  }

  private _renderLink(link: Link) {
    const source = link.source;
    const target = link.target;
    const x1 = source.left + source.width;
    const y1 = source.top + source.height / 2;
    const y2 = target.top + target.height / 2;

    const line = createSvgElement('line', {
      x1,
      y1,
      x2: target.left,
      y2,
      stroke: this._colorService.generateLinkColorForId(source.id),
      'stroke-width': '1px',
      class: 'link'
    });
    const lineHoverSelectionHandle = createSvgElement('line', {
      x1,
      y1,
      x2: target.left,
      y2,
      stroke: 'transparent',
      'stroke-width': '10px',
      class: 'link-selection-handle'
    });
    const container = createSvgElement('g', { id: link.idSelector }, { __link__: link });
    container.appendChild(line);
    container.appendChild(lineHoverSelectionHandle);
    this._wrapper.appendChild(container);
  }

}