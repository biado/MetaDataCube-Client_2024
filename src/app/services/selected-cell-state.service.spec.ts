import { TestBed } from '@angular/core/testing';

import { SelectedCellStateService } from './selected-cell-state.service';

describe('SelectedCellStateService', () => {
  let service: SelectedCellStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedCellStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
