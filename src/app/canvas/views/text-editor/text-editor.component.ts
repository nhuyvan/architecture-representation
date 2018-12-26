import { Component, ViewChild, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss']
})
export class TextEditorComponent {

  @ViewChild('input')
  private _input: ElementRef<HTMLDivElement>;

  private _textInput = new Subject<string>();

  constructor() {
    this._textInput.pipe(take(1));
  }

  snapEditorToCellBoundary(cellGeometry: ClientRect) {
    this._input.nativeElement.style.left = cellGeometry.left + 2 + 'px';
    this._input.nativeElement.style.top = cellGeometry.top + 'px';
    this._input.nativeElement.style.width = cellGeometry.width - 4 + 'px';
    this._input.nativeElement.style.height = cellGeometry.height - 2 + 'px';
    this._input.nativeElement.style.whiteSpace = 'pre';
    this._input.nativeElement.style.textAlign = 'center';
    this._input.nativeElement.style.display = 'flex';
    this._input.nativeElement.style.justifyContent = 'center';
    this._input.nativeElement.style.alignItems = 'center';
  }

  moveIntoViewIfOverflowsOffscreen(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.key === 'Backspace') {
      const inputElementBottom = this._input.nativeElement.firstElementChild.getBoundingClientRect().bottom;
      if (Math.abs(inputElementBottom - document.body.clientHeight) < 20)
        (this._input.nativeElement.firstElementChild as HTMLDivElement).style.bottom = '0';
    }
  }

  beginEditing(initialText = '') {
    this._input.nativeElement.firstElementChild.innerHTML = initialText;
    this._focus();
  }

  private _focus() {
    let range;
    let selection;
    if (window.getSelection && document.createRange) {
      range = document.createRange();
      range.selectNodeContents(this._input.nativeElement.firstElementChild);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      (this._input.nativeElement.firstElementChild as HTMLDivElement).focus();
    }
    else if ('createTextRange' in document.body) {
      // range = document.body['createTextRange']();
      // range.moveToElementText(div);
      // range.select();
    }
  }

  onBlur() {
    this._textInput.next((this._input.nativeElement.firstElementChild as HTMLDivElement).innerText.trim());
  }

  finishEditing(): Observable<string> {
    return this._textInput.asObservable();
  }

}
