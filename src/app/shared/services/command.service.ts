import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export enum Command {
  ACTIVATE_SHOW_ASSOCIATIONS, TOGGLE_SHOW_ASSOCIATIONS,
  GROUP_CELLS, UNGROUP_CELLS, ACTIVATE_CELL_GROUPING, ACTIVATE_CELL_UNGROUPING,
  SHOW_MATRICES,
  TURN_CELL_ON, TURN_CELL_OFF, ACTIVATE_TURN_OFF_CELL, ACTIVATE_TURN_ON_CELL
}

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
