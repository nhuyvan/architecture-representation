import { Directive, Input, HostListener } from '@angular/core';

import { TooltipService } from './tooltip.service';

@Directive({
  selector: '[tooltip]'
})
export class TooltipDirective {

  @Input('tooltip') content: string;
  @Input() position: 'top' | 'right' | 'bottom' | 'left' = 'bottom';

  constructor(private _tooltipService: TooltipService) { }

  @HostListener('mouseover', ['$event'])
  onMouseOver(event: MouseEvent) {
    if (this.content.length > 0) {
      event.stopPropagation();
      this._tooltipService.show(event.currentTarget as any, this.content, this.position);
    }
  }

  @HostListener('mouseout', ['$event'])
  onMouseOut(event: MouseEvent) {
    event.stopPropagation();
    this._tooltipService.hide();
  }

}