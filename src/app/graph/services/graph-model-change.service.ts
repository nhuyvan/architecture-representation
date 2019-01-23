import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { GraphModelChange, GraphModelChangeType } from '../models/GraphModelChangeType';

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
