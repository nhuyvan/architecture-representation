import { Injectable, ComponentFactoryResolver, Injector, ApplicationRef, ComponentRef } from '@angular/core';
import { DomPortalOutlet, ComponentPortal, PortalOutlet } from '@angular/cdk/portal';

import { TextEditorComponent } from './text-editor.component';
import { Cell } from '../../models/Cell';

@Injectable({
  providedIn: 'root'
})
export class TextEditorService {

  private readonly _textEditorPortal = new ComponentPortal<TextEditorComponent>(TextEditorComponent);
  private _textEditor: ComponentRef<TextEditorComponent>;
  private static readonly _DEFAULT_TEXT = 'Double click to edit';
  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _injector: Injector,
    private _appRef: ApplicationRef
  ) { }

  show(cell: Cell) {
    const outlet = this._createTextEditorComponent(cell);
    return new TextEditorComponentRef(cell, this._textEditor.instance, outlet);
  }

  private _createTextEditorComponent(cell: Cell): PortalOutlet {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay')
    const emptyOutlet = new DomPortalOutlet(overlay, this._componentFactoryResolver, this._appRef, this._injector);
    this._textEditor = emptyOutlet.attachComponentPortal(this._textEditorPortal);
    document.body.appendChild(overlay);
    this._textEditor.instance.snapEditorToCellBoundary(cell);
    this._textEditor.instance.beginEditing(cell.text === TextEditorService._DEFAULT_TEXT ? '' : cell.text);
    return emptyOutlet;
  }
}

export class TextEditorComponentRef {
  constructor(
    private readonly _cell: Cell,
    private readonly _editorComponent: TextEditorComponent,
    private readonly _portalOutlet: PortalOutlet) { }

  textAdded(cb: (payload: { text: string, textContainerHeight: number }, cellBeingEdited: Cell) => void) {
    return this._editorComponent.finishEditing()
      .subscribe(payload => {
        cb(payload, this._cell);
        this._dismiss();
      });
  }

  private _dismiss() {
    this._portalOutlet.detach();
    this._portalOutlet.dispose();
  }

}