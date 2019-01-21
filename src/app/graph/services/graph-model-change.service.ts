import { Injectable } from '@angular/core';
import { GraphModelChange, GraphModelChangeType } from '../models/GraphModelChangeType';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class GraphModelChangeService {

  private _notifier = new Subject<GraphModelChange>();
  constructor() { }

  notify(type: GraphModelChangeType, payload?: any) {
    this._notifier.next({ type, payload });
  }

  observe(): Observable<GraphModelChange> {
    return this._notifier.asObservable();
  }
}
