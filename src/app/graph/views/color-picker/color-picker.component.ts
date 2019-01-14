import { Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit, HostListener, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { take, throttleTime } from 'rxjs/operators';

@Component({
  selector: 'mapper-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements AfterViewInit {

  @Input()
  left = 0;

  @Input()
  top = 0;

  @Input()
  initialColor = '';

  @ViewChild('colorPicker')
  private _colorPickerRef: ElementRef<HTMLDivElement>;

  private _inputBroadcaster = new Subject<string>();
  private _close = new Subject<void>();

  constructor(private _ngZone: NgZone) {
    this._inputBroadcaster.pipe(throttleTime(1000));
  }

  ngAfterViewInit() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    this._colorPickerRef.nativeElement.setAttribute('style', `left:${this.left}px;top:${this.top + scrollTop}px`);
    (this._colorPickerRef.nativeElement.firstElementChild as HTMLInputElement).click();
  }

  @HostListener('window:click', ['$event.target'])
  onOverlayClicked(target: HTMLElement) {
    if (target.classList.contains('overlay'))
      this._close.next();
  }

  afterSelection(): Observable<string> {
    return this._inputBroadcaster.asObservable();
  }

  close(): Observable<void> {
    return this._close.asObservable();
  }

  selectColor(color: string) {
    this._ngZone.runOutsideAngular(() => this._inputBroadcaster.next(color));
  }

}
