import { Component, ViewChild, ElementRef, Input, OnChanges, ViewEncapsulation, Output, EventEmitter, AfterViewInit, SimpleChanges } from '@angular/core';

import { TooltipService } from '@shared/views/tooltip/tooltip.service';
import { createSvgElement } from '../../utils';
import { Link } from '../../models/Link';
import { Column } from '../../models/Column';
import { ColorService } from '../../services/color.service';
import { TextEditorService } from '../text-editor/text-editor.service';
import { Cell } from '../../models/Cell';
import { ColorPickerService } from '../color-picker/color-picker.service';

@Component({
  selector: '[links]',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LinksComponent implements OnChanges, AfterViewInit {

  @Input()
  linkTable: Map<Cell, Array<Link>>;

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
    private _tooltipService: TooltipService,
    private _colorPickerService: ColorPickerService) {
  }

  ngAfterViewInit() {
    this._wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this._linksRef.nativeElement.appendChild(this._wrapper);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this._linksRef && !changes.linkTable.firstChange) {
      // If a link is being hovered and selected at the same time
      // then it is deleted, the tooltip won't disappear
      // so hide it if there is a lingering tooltip without no anchor
      this._tooltipService.hide();
      this._renderLinks();
    }
  }

  private _renderLinks() {
    this._linksRef.nativeElement.removeChild(this._wrapper);
    this._wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.linkTable.forEach(links => {
      for (const link of links)
        this._renderLink(link);
    });
    this._linksRef.nativeElement.appendChild(this._wrapper);
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
      'stroke-width': '1',
      class: 'link'
    });
    const lineHoverSelectionHandle = createSvgElement('line', {
      x1,
      y1,
      x2: target.left,
      y2,
      stroke: 'transparent',
      class: 'link-selection-handle'
    });
    const container = createSvgElement(
      'g',
      {
        id: link.idSelector,
        stroke: this._colorService.generateLinkColorForIdSelector(source.idSelector),
        'stroke-width': '10',
      },
      {
        __link__: link
      });
    container.appendChild(line);
    container.appendChild(lineHoverSelectionHandle);
    this._wrapper.appendChild(container);
  }

  showAttributeValueEditor(event: MouseEvent, link: Link) {
    // 80px x 40px input box
    const cell = {
      top: event.clientY - 20,
      left: event.clientX - 40,
      width: 80,
      height: 40,
      text: String(link.weight)
    } as Cell;
    this._textEditorService.show(cell)
      .textAdded(value => link.weight = +value || link.weight);
  }

  selectLink(clickedItem: SVGGElement, event: MouseEvent) {
    if (clickedItem.hasAttribute('data-selected'))
      this.linkSelected.emit(null);
    else {
      const link = (clickedItem as any).__link__ as Link;
      this.linkSelected.emit(link);
      if (event.ctrlKey || event.metaKey) {
        const colorPickerRef = this._colorPickerService.show(event.clientX, event.clientY, clickedItem.getAttribute('stroke'));
        colorPickerRef.colorSelected(color => this._changeColorForLinksWithCommonSourceCell(link.source, color));
      }
    }
  }

  private _changeColorForLinksWithCommonSourceCell(sourceCell: Cell, color: string) {
    this.linkTable.get(sourceCell)
      .map(link => document.querySelector('#' + link.idSelector))
      .forEach(e => e.setAttribute('stroke', color));
    this._colorService.updateColorForIdSelector(sourceCell.idSelector, color);
  }

  showLinkTooltip(event: MouseEvent, link: Link) {
    this._tooltipService.showAt(event.clientX, event.clientY, String(link.weight), 'bottom');
  }

  hideLinkTooltip() {
    this._tooltipService.hide();
  }

}