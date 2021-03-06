import { Component, ViewChild, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Cell } from '../../models/Cell';


const columnHeaderHeight = 100;

@Component({
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss']
})
export class TextEditorComponent {

  @ViewChild('input', { static: true })
  private _input: ElementRef<HTMLDivElement>;

  private _textInput = new Subject<{ text: string, textContainerHeight: number }>();

  constructor() {
    this._textInput.pipe(take(1));
  }

  snapEditorToCellBoundary(cell: Cell) {
    const canvasScrollContainer = document.querySelector('mapper-graph');
    // If "cell" has value for "column", we are entering input for a cell
    // otherwise, it is for a link
    if (cell.column) {
      const { top, left } = canvasScrollContainer.getBoundingClientRect();
      const scrollTop = canvasScrollContainer.scrollTop;
      this._input.nativeElement.style.left = left + cell.left + 2 + 'px';
      this._input.nativeElement.style.top = (cell.top - scrollTop + 3.5 + columnHeaderHeight + top) + 'px';
    } else {
      this._input.nativeElement.style.top = (cell.top + 4) + 'px';
      this._input.nativeElement.style.left = cell.left + 2 + 'px';
    }
    this._input.nativeElement.style.width = cell.width - 4 + 'px';
    this._input.nativeElement.style.height = cell.height - 7 + 'px';

  }

  moveIntoViewIfOverflowsOffscreen(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.key === 'Enter') {
      const inputElementBottom = this._input.nativeElement.firstElementChild.getBoundingClientRect().bottom;
      if (Math.abs(inputElementBottom - document.body.clientHeight) < 20)
        (this._input.nativeElement.firstElementChild as HTMLDivElement).style.bottom = '0';
    } else if (event.key === 'Escape')
      this.onBlur();
  }

  beginEditing(initialText: string) {
    this._input.nativeElement.firstElementChild.textContent = initialText || ' ';
    this._focus();
  }

  private _focus() {
    let range: Range;
    let selection: Selection;
    if (window.getSelection && document.createRange) {
      range = document.createRange();
      range.selectNodeContents(this._input.nativeElement.firstElementChild);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      (this._input.nativeElement.firstElementChild as HTMLDivElement).focus();
    } else if ('createTextRange' in document.body) {
      // range = document.body['createTextRange']();
      // range.moveToElementText(div);
      // range.select();
    }
  }

  onBlur() {
    this._textInput.next({
      text: (this._input.nativeElement.firstElementChild as HTMLDivElement).innerText.trim(),
      textContainerHeight: this._input.nativeElement.firstElementChild.getBoundingClientRect().height
    });
  }

  finishEditing(): Observable<{ text: string, textContainerHeight: number }> {
    return this._textInput.asObservable();
  }

}
