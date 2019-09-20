import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AlertConfiguration } from './AlertConfiguration';

@Component({
  selector: 'mapper-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AlertComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) readonly config: AlertConfiguration) { }

  ngOnInit() {
  }

  onPositiveButtonClicked() {
    this.config.onPositiveButtonClicked();
  }

  onNegativeButtonClicked() {
    if (this.config.onNegativeButtonClicked)
      this.config.onNegativeButtonClicked();
  }

}
