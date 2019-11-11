import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

import { ColumnId } from '../../models/Column';

@Component({
  selector: 'g[column-header]',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ColumnHeaderComponent implements OnInit {

  @Input()
  width = 0;

  @Input()
  height = 0;

  @Input()
  left = 0;

  @Input()
  prefix: ColumnId;

  @Input()
  label = '';

  @Input()
  labelColor = '#000';

  @Output()
  addCellButtonClicked = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  onAddCellButtonClicked() {
    this.addCellButtonClicked.emit(this.prefix);
  }

}
