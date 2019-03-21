import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WindowResizeWatcherService {

  private _subject = new Subject<void>();

  constructor() {
    window.onresize = () => this._subject.next();
  }

  observe(): Observable<void> {
    return this._subject.asObservable()
      .pipe(debounceTime(500));
  }

}
