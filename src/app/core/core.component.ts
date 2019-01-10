import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { TooltipService } from '@shared/views/tooltip/tooltip.service';
import { CommandService } from '../canvas/services/command.service';
import { Command } from '../canvas/models/Command';

@Component({
  selector: 'mapper-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreComponent implements OnInit {

  showAssociations = false;
  cellGroupingSelected = true;

  constructor(private _tooltipService: TooltipService, private _commandService: CommandService) { }

  ngOnInit() {
    this._commandService.observe()
      .subscribe(command => {
        switch (command) {
          case Command.ACTIVATE_SHOW_ASSOCIATIONS:
            this.showAssociations = false;
            break;
          case Command.ACTIVATE_CELL_GROUPING:
            this.cellGroupingSelected = true;
            break;
          case Command.ACTIVATE_CELL_UNGROUPING:
            this.cellGroupingSelected = false;
            break;
        }
      });
  }

  toggleShowAssociations() {
    this._tooltipService.hide();
    this.showAssociations = !this.showAssociations;
    this._commandService.select(Command.TOGGLE_SHOW_ASSOCIATIONS);
  }

  toggleCellGrouping() {
    this._tooltipService.hide();
    this._commandService.select(this.cellGroupingSelected ? Command.GROUP_CELLS : Command.UNGROUP_CELLS);
    this.cellGroupingSelected = !this.cellGroupingSelected;
  }

  showMatrices() {
    this._commandService.select(Command.SHOW_MATRICES);
  }
}
