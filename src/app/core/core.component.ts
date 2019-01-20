import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { GraphModel } from '@shared/graph-model';
import { CommandService, CommandAction } from '@shared/command';
import { FilePickerService } from '@shared/file-picker';
import { GraphModelComparatorComponent } from 'app/graph-model-comparator/graph-model-comparator.component';

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
    private _filePicker: FilePickerService) {
  }

  ngOnInit() {
    this._commandService.observe()
      .subscribe(command => {
        switch (command.action) {
          case CommandAction.COMPARE_GRAPH_MODELS:
            if (this.currentGraphModel)
              this._filePicker.open(true)
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
            else {
              // TODO: Show dialog informing that there is no current model
            }
            break;
        }
      });
  }

  onGraphModelChanged(newModel: GraphModel) {
    this.currentGraphModel = newModel;
  }

}