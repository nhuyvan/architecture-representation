import { Component, OnInit } from '@angular/core';

import { CommandAction, CommandService } from '@shared/command';


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
        switch (command.action) {
          case CommandAction.ACTIVATE_SHOW_ASSOCIATIONS:
            this.showAssociationsSelected = false;
            break;
          case CommandAction.ACTIVATE_CELL_GROUPING:
            this.cellGroupingSelected = true;
            break;
          case CommandAction.ACTIVATE_CELL_UNGROUPING:
            this.cellGroupingSelected = false;
            break;
          case CommandAction.ACTIVATE_TURN_OFF_CELL:
            this.turnOffCellSelected = true;
            break;
          case CommandAction.ACTIVATE_TURN_ON_CELL:
            this.turnOffCellSelected = false;
            break;
        }
      });
  }


  toggleShowAssociations() {
    this._commandService.select(CommandAction.TOGGLE_SHOW_ASSOCIATIONS);
    this.showAssociationsSelected = !this.showAssociationsSelected;
  }

  toggleCellGrouping() {
    this._commandService.select(this.cellGroupingSelected ? CommandAction.GROUP_CELLS : CommandAction.UNGROUP_CELLS);
    this.cellGroupingSelected = !this.cellGroupingSelected;
  }

  showMatrices() {
    this._commandService.select(CommandAction.SHOW_MATRICES);
  }

  turnCellOnOrOff() {
    this._commandService.select(this.turnOffCellSelected ? CommandAction.TURN_CELL_OFF : CommandAction.TURN_CELL_ON);
    this.turnOffCellSelected = !this.turnOffCellSelected;
  }

  exportGraphAsPng() {
    this._commandService.select(CommandAction.EXPORT_GRAPH_AS_PNG);
  }

  editDpDetractorMatrix() {
    this._commandService.select(CommandAction.EDIT_Dp_DETRACTOR_MATRIX);
  }

  editDqDetractorMatrix() {
    this._commandService.select(CommandAction.EDIT_Dq_DETRACTOR_MATRIX);
  }

  compareGraphModels() {
    this._commandService.select(CommandAction.COMPARE_GRAPH_MODELS);
  }

  saveGraphModel() {
    this._commandService.select(CommandAction.SAVE_GRAPH_MODEL);
  }

  importGraphModel() {
    this._commandService.select(CommandAction.IMPORT_GRAPH_MODEL);
  }
}
