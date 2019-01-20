import { Component, Inject } from '@angular/core';
import { GraphModel } from '@shared/graph-model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { multiply, divide, dot, resize } from 'mathjs';

@Component({
  selector: 'mapper-graph-model-comparator',
  templateUrl: './graph-model-comparator.component.html',
  styleUrls: ['./graph-model-comparator.component.scss']
})
export class GraphModelComparatorComponent {

  constructor(@Inject(MAT_DIALOG_DATA) readonly input: { leftModel: GraphModel; rightModel: GraphModel }) { }

  calculateAngleBetweenTwoModels() {
    let q1 = this.input.leftModel.q;
    let q2 = this.input.rightModel.q;
    if (q1.length > q2.length)
      q2 = resize(q2, [q1.length], 0) as number[];
    else
      q1 = resize(q1, [q2.length], 0) as number[];
    //<q1, q2> / (|q1||q2|)
    const dotProduct = dot(q1, q2);
    const magnitude = multiply(Math.hypot(...q1), Math.hypot(...q2));
    const angle = Math.acos(divide(dotProduct, magnitude)) * Math.PI / 180;
    return angle.toFixed(2) + ' deg';
  }
}
