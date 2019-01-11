import { Component, OnInit } from '@angular/core';

import { Command, CommandService } from '@shared/services/command.service';


@Component({
  selector: 'mapper-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.scss'],
  host: {
    class: 'frame commands'
  }
})
export class CommandsComponent implements OnInit {

  showAssociationsSelected = false;
  cellGroupingSelected = true;
  turnOffCellSelected = true;

  constructor(private _commandService: CommandService) { }

  ngOnInit() {
    this._commandService.observe()
      .subscribe(command => {
        switch (command) {
          case Command.ACTIVATE_SHOW_ASSOCIATIONS:
            this.showAssociationsSelected = false;
            break;
          case Command.ACTIVATE_CELL_GROUPING:
            this.cellGroupingSelected = true;
            break;
          case Command.ACTIVATE_CELL_UNGROUPING:
            this.cellGroupingSelected = false;
            break;
          case Command.ACTIVATE_TURN_OFF_CELL:
            this.turnOffCellSelected = true;
            break;
          case Command.ACTIVATE_TURN_ON_CELL:
            this.turnOffCellSelected = false;
            break;
        }
      });
  }


  toggleShowAssociations() {
    this._commandService.select(Command.TOGGLE_SHOW_ASSOCIATIONS);
    this.showAssociationsSelected = !this.showAssociationsSelected;
  }

  toggleCellGrouping() {
    this._commandService.select(this.cellGroupingSelected ? Command.GROUP_CELLS : Command.UNGROUP_CELLS);
    this.cellGroupingSelected = !this.cellGroupingSelected;
  }

  showMatrices() {
    this._commandService.select(Command.SHOW_MATRICES);
  }

  turnCellOnOrOff() {
    this._commandService.select(this.turnOffCellSelected ? Command.TURN_CELL_OFF : Command.TURN_CELL_ON);
    this.turnOffCellSelected = !this.turnOffCellSelected;
  }

  exportGraphAsPng() {
    this._commandService.select(Command.EXPORT_GRAPH_AS_PNG);
  }

}
