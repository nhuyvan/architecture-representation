import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FilePickerService {

  private _fileSelection = new Subject<File>();

  constructor() {
  }

  selectFile(file: File) {
    this._fileSelection.next(file);
  }

  open(): Observable<File> {
    const filePicker = document.querySelector('input.file-picker') as HTMLInputElement;
    filePicker.click();
    return this._fileSelection.asObservable()
      .pipe(take(1));
  }
}
