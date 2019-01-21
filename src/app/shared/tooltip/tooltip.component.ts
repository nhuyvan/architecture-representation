import { Component, ViewEncapsulation, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { trigger, transition, state, style, animate, AnimationEvent } from '@angular/animations';

@Component({
  selector: 'mapper-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fade', [
      state('true', style({ opacity: '1', visibility: 'visible' })),
      state('false', style({ opacity: '0', visibility: 'hidden' })),
      transition('* <=> *', animate('250ms ease'))
    ])
  ]
})
export class TooltipComponent implements AfterViewInit {

  @Input() content: string;
  @Input() position: 'top' | 'right' | 'bottom' | 'left' = 'bottom';

  // Should the tooltip be closed immediately or stay persistent
  transient = true;

  showFlag = false;

  @ViewChild('tooltip')
  private _tooltipElementRef: ElementRef;
  private _tooltip: HTMLDivElement;
  private _onHide: () => void;
  private _width = 0;
  private _height = 0;

  constructor() { }

  ngAfterViewInit() {
    if (!['top', 'right', 'bottom', 'left'].includes(this.position))
      throw new Error('Invalid tooltip position: ' + this.position);
    this._tooltip = this._tooltipElementRef.nativeElement;
    const tooltipRect = this._tooltip.getBoundingClientRect();
    this._width = tooltipRect.width;
    this._height = tooltipRect.height;
  }

  hide() {
    this.showFlag = false;
  }

  onMouseOut(target) {
    if (target === this._tooltip || this._tooltip.contains(target))
      this._tooltip.style.opacity = '1';
  }

  onMouseOver(target) {
    if (target === this._tooltip || this._tooltip.contains(target)) {
      this._tooltip.style.opacity = '0';
    }
  }

  setOnHide(fn: () => void) {
    this._onHide = fn;
  }

  show(origin: HTMLElement | SVGElement) {
    this.showFlag = true;
    switch (this.position) {
      case 'top':
        this._showTop(origin.getBoundingClientRect());
        break;
      case 'right':
        this._showRight(origin.getBoundingClientRect());
        break;
      case 'bottom':
        this._showBottom(origin.getBoundingClientRect());
        break;
      case 'left':
        this._showLeft(origin.getBoundingClientRect());
        break;
    }
  }

  showAt(x: number, y: number) {
    this.showFlag = true;
    const originRect = { left: x, top: y, width: 0, height: 0, right: 0, bottom: 0 };
    switch (this.position) {
      case 'top':
        this._showTop(originRect);
        break;
      case 'right':
        this._showRight(originRect);
        break;
      case 'bottom':
        this._showBottom(originRect);
        break;
      case 'left':
        this._showLeft(originRect);
        break;
    }
  }

  onFadeDone(event: AnimationEvent) {
    if ((event.toState as any) === false && this._onHide)
      this._onHide();
  }

  private _showTop(originRect: ClientRect) {
    setTimeout(() => {
      const left = originRect.left + (originRect.width - this._width) / 2;
      let top = originRect.top - originRect.height - 25;
      if (top < 0) {
        this._tooltip.classList.remove('top');
        this._tooltip.classList.add('bottom');
        top = top + originRect.height + this._height + 25;
      }
      this._tooltip.style.left = left + 'px';
      this._tooltip.style.top = top + 'px';
    }, 0);

  }

  private _showBottom(originRect: ClientRect) {
    setTimeout(() => {
      const left = originRect.left + (originRect.width - this._width) / 2;
      let top = originRect.top + originRect.height + 12;
      if (top + this._height + 10 > document.body.clientHeight) {
        this._tooltip.classList.remove('bottom');
        this._tooltip.classList.add('top');
        top = top - originRect.height - this._height - 30;
      }
      this._tooltip.style.left = left + 'px';
      this._tooltip.style.top = top + 'px';
    }, 0);

  }

  private _showRight(originRect: ClientRect) {
    setTimeout(() => {
      let left = originRect.left + originRect.width + 10;
      const top = originRect.top + (originRect.height - this._height) / 2;
      if (left + this._width > document.body.clientWidth) {
        this._tooltip.classList.remove('right');
        this._tooltip.classList.add('left');
        left = left - originRect.width - this._width - 30;
      }
      this._shiftTooltipIntoViewFromBottom(top);
      this._tooltip.style.left = left + 'px';
      this._tooltip.style.top = top + 'px';
    }, 0);
  }

  private _showLeft(originRect: ClientRect) {
    /*
      Wrap this in a setTimeout because tooltip is animated, so by the time getBoundingClientRect()
      is called, tooltip component might not be visible yet, so it can't calculate tooltip's client rect
    */
    setTimeout(() => {
      let left = originRect.left - this._width - 15;
      const top = originRect.top + (originRect.height - this._height) / 2;
      if (left < 0) {
        this._tooltip.classList.remove('left');
        this._tooltip.classList.add('right');
        left = left + originRect.width + this._width + 30;
      }
      if (!this._shiftTooltipIntoViewFromBottom(top))
        this._shiftTooltipIntoViewFromTop(top);
      this._tooltip.style.left = left + 'px';
      this._tooltip.style.top = top + 'px';
    }, 0);

  }

  private _shiftTooltipIntoViewFromBottom(top: number) {
    const difference = top + this._height - document.body.clientHeight + 5;
    if (difference > 5) {
      this._tooltip.style.transform = `translateY(-${difference}px)`;
      (this._tooltip.querySelector('.mapper-tooltip__arrow') as HTMLElement).style.top = `calc(50% + ${difference}px)`;
      return true;
    }
    return false;
  }

  private _shiftTooltipIntoViewFromTop(top: number) {
    if (top < 0) {
      top = Math.abs(top) + 5;
      this._tooltip.style.transform = `translateY(${top}px)`;
      (this._tooltip.querySelector('.mapper-tooltip__arrow') as HTMLElement).style.top = `calc(50% - ${top}px)`;
      return true;
    }
    return false;
  }

}