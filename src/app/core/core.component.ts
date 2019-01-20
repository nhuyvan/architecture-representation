import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GraphModel } from '@shared/graph-model';

@Component({
  selector: 'mapper-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreComponent {

  currentGraphModel: GraphModel;

  onGraphModelChanged(newModel: GraphModel) {
    this.currentGraphModel = newModel;
  }

}