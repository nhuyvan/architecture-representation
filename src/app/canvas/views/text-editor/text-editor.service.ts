import { Injectable, ComponentFactoryResolver, Injector, ApplicationRef, ComponentRef } from '@angular/core';
import { DomPortalOutlet, ComponentPortal, PortalOutlet } from '@angular/cdk/portal';

import { TextEditorComponent } from './text-editor.component';

@Injectable({
  providedIn: 'root'
})
export class TextEditorService {

  private readonly _textEditorPortal = new ComponentPortal<TextEditorComponent>(TextEditorComponent);
  private _textEditor: ComponentRef<TextEditorComponent>;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _injector: Injector,
    private _appRef: ApplicationRef
  ) { }

  show(cellGeometry: ClientRect, initialText = '') {
    const outlet = this._createTextEditorComponent(cellGeometry, initialText);
    return new TextEditorComponentRef(this._textEditor.instance, outlet);
  }

  private _createTextEditorComponent(cellGeometry: ClientRect, initialText: string): PortalOutlet {
    const textEditorContainer = document.createElement('div');
    const emptyOutlet = new DomPortalOutlet(textEditorContainer, this._componentFactoryResolver, this._appRef, this._injector);
    this._textEditor = emptyOutlet.attachComponentPortal(this._textEditorPortal);
    document.body.appendChild(textEditorContainer);
    this._textEditor.instance.snapEditorToCellBoundary(cellGeometry);
    this._textEditor.instance.beginEditing(initialText);
    return emptyOutlet;
  }
}

export class TextEditorComponentRef {
  constructor(private readonly _editorComponent: TextEditorComponent, private readonly _portalOutlet: PortalOutlet) { }

  textAdded(cb: (text: string) => void) {
    return this._editorComponent.finishEditing()
      .subscribe(text => {
        cb(text);
        this._dismiss();
      });
  }

  private _dismiss() {
    this._portalOutlet.detach();
    this._portalOutlet.dispose();
  }
}