import { TestBed } from '@angular/core/testing';

import { ColumnLayoutChangeService } from './column-layout-change.service';

describe('ColumnLayoutChangeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ColumnLayoutChangeService = TestBed.get(ColumnLayoutChangeService);
    expect(service).toBeTruthy();
  });
});
