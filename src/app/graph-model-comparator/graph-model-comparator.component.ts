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

  readonly q1: GraphModel;
  readonly q2: GraphModel;
  readonly q1Name: string;
  readonly q2Name: string;

  constructor(@Inject(MAT_DIALOG_DATA) models: { q1: GraphModel; q2: GraphModel }) {
    this.q1 = models.q1;
    this.q2 = models.q2;
    this.q1Name = models.q1.attributes['Graph name'] || 'q1';
    this.q2Name = models.q2.attributes['Graph name'] || 'q2';
  }

  calculateAngleBetweenTwoModels() {
    let q1 = this.q1.q;
    let q2 = this.q2.q;
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
