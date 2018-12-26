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
    this._tooltipService.show(event.currentTarget as any, this.content, this.position);
  }

  @HostListener('mouseout')
  onMouseOut() {
    this._tooltipService.hide();
  }

}