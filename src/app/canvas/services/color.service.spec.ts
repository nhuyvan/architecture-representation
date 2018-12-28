import { TestBed } from '@angular/core/testing';

import { ColorService } from './color.service';

describe('ColorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should not hang', () => {
    const service: ColorService = TestBed.get(ColorService);
    for (let i = 0; i < 100; i++)
      expect(typeof (service.generateLinkColorForId(i))).toBe('string');
  });
});
