import { Injectable, ComponentFactoryResolver, Injector, ApplicationRef, ComponentRef } from '@angular/core';
import { DomPortalOutlet, ComponentPortal } from '@angular/cdk/portal';

import { TooltipComponent } from './tooltip.component';

@Injectable({
  providedIn: 'root'
})
export class TooltipService {

  private readonly _tooltipPortal = new ComponentPortal<TooltipComponent>(TooltipComponent);
  private _tooltip: ComponentRef<TooltipComponent>;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _injector: Injector,
    private _appRef: ApplicationRef
  ) { }

  show(origin: HTMLElement | SVGElement, content: string, position: 'top' | 'right' | 'bottom' | 'left', container?: Element) {
    this._createTooltip(content, position, container);
    this._tooltip.instance.show(origin);
    return this._tooltip.instance;
  }

  showAt(x: number, y: number, content: string, position: 'top' | 'right' | 'bottom' | 'left', container?: Element) {
    this._createTooltip(content, position, container);
    this._tooltip.instance.showAt(x, y);
    return this._tooltip.instance;
  }

  hide() {
    if (this._tooltip && this._tooltip.instance.transient)
      this._tooltip.instance.hide();
  }

  private _createTooltipContainer(): HTMLElement {
    const tooltipContainer = document.createElement('div');
    tooltipContainer.classList.add('tooltip-container');
    return tooltipContainer;
  }

  private _createTooltip(content: string, position, container: Element = document.body) {
    const tooltipContainer = this._createTooltipContainer();
    const emptyOutlet = new DomPortalOutlet(tooltipContainer, this._componentFactoryResolver, this._appRef, this._injector);
    this._tooltip = emptyOutlet.attachComponentPortal(this._tooltipPortal);
    this._tooltip.instance.content = content;
    this._tooltip.instance.setOnHide(() => emptyOutlet.dispose());
    this._tooltip.instance.position = position;
    this._tooltip.instance.transient = container === document.body;
    container.appendChild(tooltipContainer);
  }
}