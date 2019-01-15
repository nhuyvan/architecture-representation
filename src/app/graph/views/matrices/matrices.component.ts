import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

type Input = {
  matrices: Array<{ name: string; entries: number[][] }>;
  angle: number;
};

@Component({
  selector: 'mapper-matrices',
  templateUrl: './matrices.component.html',
  styleUrls: ['./matrices.component.scss']
})
export class MatricesComponent {

  matrices: Array<{ name: string; entries: number[][] }>;
  angle: number
  constructor(@Inject(MAT_DIALOG_DATA) readonly input: Input) {
    this.matrices = input.matrices;
    this.angle = input.angle;
  }

}
