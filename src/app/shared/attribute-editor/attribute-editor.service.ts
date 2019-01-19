import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { Attribute } from './Attribute';
import { AttributeEditorComponent } from './attribute-editor.component';

@Injectable({
  providedIn: 'root'
})
export class AttributeEditorService {

  constructor(private _matDialog: MatDialog) { }

  open(initialAttributes: Attribute[]): Observable<Attribute[]> {
    return this._matDialog.open(AttributeEditorComponent, {
      data: initialAttributes
    })
      .afterClosed();
  }
}
