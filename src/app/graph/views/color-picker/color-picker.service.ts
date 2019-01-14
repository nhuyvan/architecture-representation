import { Injectable, ComponentRef, ComponentFactoryResolver, Injector, ApplicationRef } from '@angular/core';
import { ComponentPortal, PortalOutlet, DomPortalOutlet } from '@angular/cdk/portal';

import { ColorPickerComponent } from './color-picker.component';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColorPickerService {

  private readonly _colorPickerPortal = new ComponentPortal<ColorPickerComponent>(ColorPickerComponent);
  private _colorPicker: ComponentRef<ColorPickerComponent>;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _injector: Injector,
    private _appRef: ApplicationRef
  ) { }

  show(x: number, y: number, initialColor: string) {
    const outlet = this._createColorPickerComponent(x, y, initialColor);
    return new ColorPickerComponentRef(this._colorPicker.instance, outlet);
  }

  private _createColorPickerComponent(x: number, y: number, initialColor: string): PortalOutlet {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    const emptyOutlet = new DomPortalOutlet(overlay, this._componentFactoryResolver, this._appRef, this._injector);
    this._colorPicker = emptyOutlet.attachComponentPortal(this._colorPickerPortal);
    this._colorPicker.instance.left = x;
    this._colorPicker.instance.top = y;
    this._colorPicker.instance.initialColor = initialColor;
    document.body.appendChild(overlay);
    return emptyOutlet;
  }
}

export class ColorPickerComponentRef {
  private _inputWatcher: Subscription;
  private _closeCallback: () => void;

  constructor(
    private readonly _colorPicker: ColorPickerComponent,
    private readonly _portalOutlet: PortalOutlet) {

    const closeWatcher = _colorPicker.close()
      .subscribe(() => {
        if (this._closeCallback)
          this._closeCallback();
        this._dismiss();
        this._inputWatcher.unsubscribe();
        closeWatcher.unsubscribe();
      });
  }

  colorSelected(cb: (selectorColor: string) => void) {
    this._inputWatcher = this._colorPicker.afterSelection()
      .subscribe(text => cb(text));
  }

  afterClosed(cb: () => void) {
    this._closeCallback = cb;
  }

  private _dismiss() {
    this._portalOutlet.detach();
    this._portalOutlet.dispose();
  }
}