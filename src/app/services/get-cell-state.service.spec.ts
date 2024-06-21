import { TestBed } from '@angular/core/testing';

import { GetCellStateService } from './get-cell-state.service';

describe('GetCellStateService', () => {
  let service: GetCellStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetCellStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
