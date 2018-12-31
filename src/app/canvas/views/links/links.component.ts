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
  private _linkContainerRef: ElementRef<SVGGElement>;
  private _wrapper: SVGGElement;

  constructor(
    private _colorService: ColorService,
    private _textEditorService: TextEditorService,
    private _tooltipService: TooltipService,
    private _colorPickerService: ColorPickerService) {
  }

  ngAfterViewInit() {
    this._wrapper = createSvgElement('g') as SVGGElement;
    this._linkContainerRef.nativeElement.appendChild(this._wrapper);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this._linkContainerRef && !changes.linkTable.firstChange) {
      // If a link is being hovered and selected at the same time
      // then it is deleted, the tooltip won't disappear
      // so hide it if there is a lingering tooltip without no anchor
      this._tooltipService.hide();
      this._renderLinks();
    }
  }

  private _renderLinks() {
    this._linkContainerRef.nativeElement.removeChild(this._wrapper);
    this._wrapper = createSvgElement('g') as SVGGElement;
    this.linkTable.forEach(links => {
      for (const link of links)
        this._renderLink(link);
    });
    this._linkContainerRef.nativeElement.appendChild(this._wrapper);
  }

  private _renderLink(link: Link) {
    const source = link.source;
    const target = link.target;
    const x1 = source.left + source.width;
    const y1 = source.top + source.height / 2;
    const x2 = target.left;
    const y2 = target.top + target.height / 2;

    if (!link.domInstance) {
      const line = createSvgElement('line', { class: 'link' });
      const lineHoverSelectionHandle = createSvgElement('line', { class: 'link-selection-handle' });
      const container = createSvgElement(
        'g',
        {
          id: link.idSelector,
          stroke: this._colorService.getLinkColorWithSourceCell(source)
        },
        {
          __link__: link
        }) as SVGGElement;
      container.appendChild(line);
      container.appendChild(lineHoverSelectionHandle);
      link.domInstance = container;
    }
    this._repositionLineElement(x1, y1, x2, y2, link.domInstance.firstElementChild as SVGLineElement);
    this._repositionLineElement(x1, y1, x2, y2, link.domInstance.lastElementChild as SVGLineElement);
    this._wrapper.appendChild(link.domInstance);
  }

  private _repositionLineElement(x1: number, y1: number, x2: number, y2: number, line: SVGLineElement) {
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
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
        colorPickerRef.colorSelected(color => this._changeColorForLinksWithSourceCell(link.source, color));
      }
    }
  }

  private _changeColorForLinksWithSourceCell(sourceCell: Cell, color: string) {
    this.linkTable.get(sourceCell)
      .forEach(link => link.domInstance.setAttribute('stroke', color));
    this._colorService.updateLinkColorWithSourceCell(sourceCell, color);
  }

  showLinkTooltip(event: MouseEvent, link: Link) {
    this._tooltipService.showAt(event.clientX, event.clientY, String(link.weight), 'bottom');
  }

  hideLinkTooltip() {
    this._tooltipService.hide();
  }

}