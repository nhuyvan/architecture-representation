import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { GraphModel } from '@shared/graph-model';
import { CommandService, CommandAction } from '@shared/command';
import { FilePickerService } from '@shared/file-picker';
import { GraphModelComparatorComponent } from 'app/graph-model-comparator/graph-model-comparator.component';
import { AlertService } from '@shared/alert/alert.service';

@Component({
  selector: 'mapper-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreComponent implements OnInit {

  currentGraphModel: GraphModel;
  graphModelToCompareAgainst: GraphModel;

  constructor(
    private _matDialog: MatDialog,
    private _commandService: CommandService,
    private _filePicker: FilePickerService,
    private _alertService: AlertService
  ) {
  }

  ngOnInit() {
    this._commandService.observe()
      .subscribe(command => {
        switch (command.action) {
          case CommandAction.COMPARE_GRAPH_MODELS:
            this._compareGraphModels();
            break;
        }
      });
  }

  private _compareGraphModels() {
    if (this.currentGraphModel) {
      this._filePicker.clearSelection();
      this._filePicker.open()
        .readFileAsJson()
        // .pipe(catchError()) TODO: Show error dialog
        .subscribe(model => {
          if (model)
            this._matDialog.open(GraphModelComparatorComponent, {
              data: {
                q1: this.currentGraphModel,
                q2: model
              },
              autoFocus: false
            });
        });
    } else {
      // TODO: Show dialog informing that there is no current model
      this._alertService.addMessage(`There's no active graph model`)
        .addNegativeButton('Close')
        .show();
    }
  }


  onGraphModelChanged(newModel: GraphModel) {
    this.currentGraphModel = newModel;
  }

}
