import { TestBed } from '@angular/core/testing';

import { AttributeEditorService } from './attribute-editor.service';

describe('AttributeCaptureService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AttributeEditorService = TestBed.get(AttributeEditorService);
    expect(service).toBeTruthy();
  });
});
