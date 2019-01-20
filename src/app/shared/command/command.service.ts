import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { CommandAction, Command } from './Command';

@Injectable({
  providedIn: 'root'
})
export class CommandService {

  private _commandSelected = new Subject<Command>();

  constructor() { }

  select(action: CommandAction, payload?: any) {
    this._commandSelected.next({ action, payload });
  }

  observe(): Observable<Command> {
    return this._commandSelected.asObservable();
  }
}
