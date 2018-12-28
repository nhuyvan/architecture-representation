import { Component, ViewChild, ElementRef, Input, OnChanges, ViewEncapsulation, Output, EventEmitter, AfterViewInit } from '@angular/core';

import { TooltipService } from '@shared/views/tooltip/tooltip.service';
import { createSvgElement } from '../../utils';
import { Link } from '../../models/Link';
import { Column } from '../../models/Column';
import { ColorService } from '../../services/color.service';
import { TextEditorService } from '../text-editor/text-editor.service';
import { Cell } from '../../models/Cell';

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

  constructor(
    private _colorService: ColorService,
    private _textEditorService: TextEditorService,
    private _tooltipService: TooltipService) {
  }

  ngAfterViewInit() {
    this._wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this._linksRef.nativeElement.appendChild(this._wrapper);
  }

  ngOnChanges() {
    if (this._linksRef && this.linkTable && this.columns && this._wrapper) {
      // If a link is being hovered and selected at the same time
      // then it is deleted, the tooltip won't disappear
      // so hide it if there is a lingering tooltip without no anchor
      this._tooltipService.hide();
      this._linksRef.nativeElement.removeChild(this._wrapper);
      this._wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      for (const sourceCellSelector in this.linkTable)
        for (const link of this.linkTable[sourceCellSelector])
          this._renderLink(link);
      this._linksRef.nativeElement.appendChild(this._wrapper);
    }
  }

  showAttributeValueEditor(event: MouseEvent, link: Link) {
    // 80px x 40px input box
    const cell = {
      top: event.clientY - 20,
      left: event.clientX - 40,
      width: 80,
      height: 40,
      text: link.weight
    } as Cell;
    this._textEditorService.show(cell)
      .textAdded(value => link.weight = String(+value || link.weight));
  }

  selectLink(clickedItem: any) {
    this.linkSelected.emit(clickedItem.hasAttribute('data-selected') ? null : clickedItem.__link__);
  }

  showLinkTooltip(event: MouseEvent, link: Link) {
    this._tooltipService.showAt(event.clientX, event.clientY, link.weight, 'bottom');
  }

  hideLinkTooltip() {
    this._tooltipService.hide();
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