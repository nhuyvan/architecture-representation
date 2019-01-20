import { Component, ViewChild, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Cell } from '../../models/Cell';

@Component({
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss']
})
export class TextEditorComponent {

  @ViewChild('input')
  private _input: ElementRef<HTMLDivElement>;

  private _textInput = new Subject<{ text: string, textContainerHeight: number }>();

  private _isEditing = false;

  constructor() {
    this._textInput.pipe(take(1));
  }

  snapEditorToCellBoundary(cell: Cell) {
    const canvasScrollContainer = document.querySelector('mapper-graph');
    const scrollTop = canvasScrollContainer.scrollTop;
    // If "cell" has value for "column", we are entering input for a cell
    // otherwise, it is for a link
    if (cell.column) {
      const left = canvasScrollContainer.getBoundingClientRect().left;
      this._input.nativeElement.style.left = left + cell.left + 2 + 'px';
      // 100 is column header height
      this._input.nativeElement.style.top = (cell.top - scrollTop + 7 + 100) + 'px';
    }
    else {
      this._input.nativeElement.style.top = (cell.top - scrollTop + 7) + 'px';
      this._input.nativeElement.style.left = cell.left + 2 + 'px';
    }
    this._input.nativeElement.style.width = cell.width - 4 + 'px';
    this._input.nativeElement.style.height = cell.height - 7 + 'px';
    this._input.nativeElement.style.whiteSpace = 'pre';
    this._input.nativeElement.style.textAlign = 'center';
    this._input.nativeElement.style.display = 'flex';
    this._input.nativeElement.style.justifyContent = 'center';
    this._input.nativeElement.style.alignItems = 'center';
  }

  moveIntoViewIfOverflowsOffscreen(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const inputElementBottom = this._input.nativeElement.firstElementChild.getBoundingClientRect().bottom;
      if (Math.abs(inputElementBottom - document.body.clientHeight) < 20)
        (this._input.nativeElement.firstElementChild as HTMLDivElement).style.bottom = '0';
    }
  }

  beginEditing(initialText: string) {
    this._isEditing = true;
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

  saveTextOnEscapeKeyPressed(event: KeyboardEvent) {
    if (event.key === 'Escape' && this._isEditing)
      this.onBlur();
  }

  onBlur() {
    this._textInput.next({
      text: (this._input.nativeElement.firstElementChild as HTMLDivElement).innerText.trim(),
      textContainerHeight: this._input.nativeElement.firstElementChild.getBoundingClientRect().height
    });
    this._isEditing = false;
  }

  finishEditing(): Observable<{ text: string, textContainerHeight: number }> {
    return this._textInput.asObservable();
  }

}
