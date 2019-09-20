import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { AlertConfiguration } from './AlertConfiguration';
import { AlertComponent } from './alert.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private _dialogConfig: AlertConfiguration = {
    message: '',
    positiveButtonLabel: '',
    onPositiveButtonClicked: null,
    negativeButtonLabel: '',
    onNegativeButtonClicked: null,
    dismissable: true,
    showOverlay: true
  };

  private _dialogRef: MatDialogRef<AlertComponent>;

  constructor(private _matDialog: MatDialog) {
    this.close = this.close.bind(this);
  }

  addPositiveButton(label: string, onClick: () => void): AlertService {
    this._dialogConfig.positiveButtonLabel = label;
    this._dialogConfig.onPositiveButtonClicked = onClick;
    return this;
  }

  addNegativeButton(label: string, onClick?: () => void): AlertService {
    this._dialogConfig.negativeButtonLabel = label;
    this._dialogConfig.onNegativeButtonClicked = onClick;
    return this;
  }

  addMessage(message: string): AlertService {
    this._dialogConfig.message = message;
    return this;
  }

  notDismissable(): AlertService {
    this._dialogConfig.dismissable = false;
    return this;
  }

  noOverlay(): AlertService {
    this._dialogConfig.showOverlay = false;
    return this;
  }

  show() {
    this._dialogRef = this._matDialog.open(
      AlertComponent,
      {
        data: this._dialogConfig,
        autoFocus: false,
        disableClose: !this._dialogConfig.dismissable,
        hasBackdrop: this._dialogConfig.showOverlay
      }
    );
  }

  close() {
    if (this._dialogRef)
      this._dialogRef.close();
  }

}
