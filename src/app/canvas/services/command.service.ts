import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { Command } from '../models/Command';

@Injectable({
  providedIn: 'root'
})
export class CommandService {

  private _commandSelected = new Subject<Command>();

  constructor() { }

  select(command: Command) {
    this._commandSelected.next(command);
  }

  observe(): Observable<Command> {
    return this._commandSelected.asObservable();
  }
}
