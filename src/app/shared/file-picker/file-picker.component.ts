import { Component } from '@angular/core';

import { FilePickerService } from './file-picker.service';

@Component({
  selector: 'mapper-file-picker',
  templateUrl: './file-picker.component.html',
  styleUrls: ['./file-picker.component.scss']
})
export class FilePickerComponent {

  constructor(private _filePickerService: FilePickerService) { }


  onFileSelected(file: File) {
    this._filePickerService.selectFile(file);
  }

}
