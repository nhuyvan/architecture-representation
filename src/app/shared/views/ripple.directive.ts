import { Directive, Input, ElementRef, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[ripple]',
  host: {
    'class': 'ripple'
  }
})
export class RippleDirective implements OnInit {

  @Input() center = false;
  @Input() duration = 750;

  private _rippleTrigger: HTMLElement = null;

  constructor(private host: ElementRef) { }

  ngOnInit() {
    this._rippleTrigger = this.host.nativeElement;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    const rect = this._rippleTrigger.getBoundingClientRect();
    const rippleContainer = document.createElement('div');
    rippleContainer.className = 'ripple';
    const rippler = document.createElement('span');
    const largerDimension = Math.max(rect.width, rect.height);
    if (this.center) {
      rippler.style.left = '0';
      rippler.style.top = '0';
    }
    else {
      const x = event.clientX - rect.left - largerDimension / 2;
      const y = event.clientY - rect.top - largerDimension / 2;
      rippler.style.left = x + 'px';
      rippler.style.top = y + 'px';
    }
    rippleContainer.style.width = largerDimension + 'px';
    rippleContainer.style.height = largerDimension + 'px';
    rippler.style.width = largerDimension + 'px';
    rippler.style.height = largerDimension + 'px';
    rippler.style.animationDuration = `${this.duration}ms`;
    rippleContainer.appendChild(rippler);
    this._rippleTrigger.appendChild(rippleContainer);
    setTimeout(() => this._rippleTrigger.removeChild(rippleContainer), this.duration);
  }
}