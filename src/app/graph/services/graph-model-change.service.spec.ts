import { TestBed } from '@angular/core/testing';

import { GraphModelChangeService } from './graph-model-change.service';

describe('GraphModelChangeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GraphModelChangeService = TestBed.get(GraphModelChangeService);
    expect(service).toBeTruthy();
  });
});
