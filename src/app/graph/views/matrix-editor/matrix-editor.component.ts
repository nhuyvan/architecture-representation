import { Component, OnInit, Inject } from '@angular/core';
import { Matrix, matrix } from 'mathjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mapper-matrix-editor',
  templateUrl: './matrix-editor.component.html',
  styleUrls: ['./matrix-editor.component.scss']
})
export class MatrixEditorComponent implements OnInit {

  readonly entries: number[][];
  readonly matrixName: string;
  readonly newMatrix: Matrix;

  constructor(@Inject(MAT_DIALOG_DATA) readonly input: { matrix: Matrix; matrixName: string }) {
    this.entries = input.matrix.toArray() as number[][];
    this.newMatrix = input.matrix.clone();
    this.matrixName = input.matrixName;
  }

  ngOnInit() {
  }

  updateEntry(rowIndex: number, columnIndex: number, element: HTMLInputElement) {
    const newValue = +element.value;
    if (newValue >= 0)
      this.newMatrix.set([rowIndex, columnIndex], newValue);
    else
      element.value = String(this.entries[rowIndex][columnIndex]);
  }

}
