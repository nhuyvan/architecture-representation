import { TestBed } from '@angular/core/testing';

import { FilePickerService } from './file-picker.service';

describe('FilePickerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FilePickerService = TestBed.get(FilePickerService);
    expect(service).toBeTruthy();
  });
});
