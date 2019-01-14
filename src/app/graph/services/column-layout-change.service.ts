import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ColumnLayoutChange, ColumnLayoutChangeType } from '../models/ColumnLayoutChange';
import { ColumnId } from '../models/Column';
import { Cell } from '../models/Cell';

@Injectable({
  providedIn: 'root'
})
export class ColumnLayoutChangeService {

  private _columnLayoutChanged = new Subject<ColumnLayoutChange>();

  constructor() { }

  notify(columnId: ColumnId, type: ColumnLayoutChangeType, trigger: Cell) {
    this._columnLayoutChanged.next({ column: columnId, type, trigger });
  }

  observe(): Observable<ColumnLayoutChange> {
    return this._columnLayoutChanged.asObservable();
  }
}
