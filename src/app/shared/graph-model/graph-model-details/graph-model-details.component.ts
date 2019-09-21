import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { GraphModel } from '../GraphModel';

@Component({
  selector: 'mapper-graph-model-details',
  templateUrl: './graph-model-details.component.html',
  styleUrls: ['./graph-model-details.component.scss'],
  host: {
    class: 'frame'
  }
})
export class GraphModelDetailsComponent implements OnChanges {

  @Input()
  graphModel: GraphModel;

  @Input()
  rowDisplay = true;

  details: Array<{ name: string; value: any }>;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if ('graphModel' in changes) {
      if (this.graphModel)
        this.details = [
          { name: 'Graph name', value: this.graphModel.attributes['Graph name'] },
          { name: 'A<q, r>', value: this.graphModel.angle },
          { name: 'S(q, r)', value: this.graphModel.strength },
        ];
      else
        this.details = [];
    }
  }

}
