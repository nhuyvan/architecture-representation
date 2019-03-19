import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { ColumnLayoutChange, ColumnLayoutChangeType } from '../models/ColumnLayoutChange';
import { Cell } from '../models/Cell';

@Injectable({
  providedIn: 'root'
})
export class ColumnLayoutChangeService {

  private _columnLayoutChanged = new Subject<ColumnLayoutChange>();

  constructor() { }

  notify(type: ColumnLayoutChangeType, trigger: Cell) {
    this._columnLayoutChanged.next({ type, trigger });
  }

  observe(): Observable<ColumnLayoutChange> {
    return this._columnLayoutChanged.asObservable();
  }
}
