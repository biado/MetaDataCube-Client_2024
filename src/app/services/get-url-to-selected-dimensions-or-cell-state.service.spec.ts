import { TestBed } from '@angular/core/testing';

import { GetUrlToSelectedDimensionsOrCellStateService } from './get-url-to-selected-dimensions-or-cell-state.service';

describe('GetCellUrlService', () => {
  let service: GetUrlToSelectedDimensionsOrCellStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetUrlToSelectedDimensionsOrCellStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
