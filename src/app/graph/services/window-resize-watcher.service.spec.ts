import { TestBed } from '@angular/core/testing';

import { WindowResizeWatcherService } from './window-resize-watcher.service';

describe('WindowResizeWatcherService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WindowResizeWatcherService = TestBed.get(WindowResizeWatcherService);
    expect(service).toBeTruthy();
  });
});
