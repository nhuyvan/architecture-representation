import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mapper-matrices',
  templateUrl: './matrices.component.html',
  styleUrls: ['./matrices.component.scss']
})
export class MatricesComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) readonly matrices: Array<{ name: string; entries: number[][] }>) { }

  ngOnInit() {
  }

}
