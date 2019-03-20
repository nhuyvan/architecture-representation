import { Directive, Input, HostListener, OnDestroy } from '@angular/core';

import { TooltipService } from './tooltip.service';

@Directive({
  selector: '[tooltip], [tooltipAt]'
})
export class TooltipDirective implements OnDestroy {

  @Input('tooltip') content = '';
  @Input('tooltipAt') contentAt = '';

  @Input() position: 'top' | 'right' | 'bottom' | 'left' = 'bottom';

  constructor(private _tooltipService: TooltipService) { }

  ngOnDestroy() {
    this._tooltipService.hide();
  }

  @HostListener('mouseover', ['$event'])
  onMouseOver(event: MouseEvent) {
    if (this.content.length > 0) {
      event.stopPropagation();
      this._tooltipService.show(event.currentTarget as any, this.content, this.position);
    } else if (this.contentAt.length > 0) {
      event.stopPropagation();
      this._tooltipService.showAt(event.clientX, event.clientY, this.contentAt, this.position);
    }
  }

  @HostListener('mouseout', ['$event'])
  onMouseOut(event: MouseEvent) {
    event.stopPropagation();
    this._tooltipService.hide();
  }

}
