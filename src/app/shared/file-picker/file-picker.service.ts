import { Injectable } from '@angular/core';
import { Subject, Observable, fromEvent, of } from 'rxjs';
import { take, map, switchMap } from 'rxjs/operators';

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

  clearSelection() {
    (document.querySelector('input.file-picker').parentElement as HTMLFormElement).reset();
  }

  open(): FilePickerService {
    const filePicker = document.querySelector('input.file-picker') as HTMLInputElement;
    filePicker.click();
    return this;
  }

  readFileAsJson<T>(): Observable<T> {
    return this._fileSelection.asObservable()
      .pipe(
        switchMap(file => {
          if (file) {
            const fileReader = new FileReader();
            const fileReaderResultObservable = fromEvent(fileReader, 'load')
              .pipe(map(() => JSON.parse(fileReader.result as string) as T));
            fileReader.readAsText(file);
            return fileReaderResultObservable;
          }
          return of(null);
        }),
        take(1)
      );
  }
}
