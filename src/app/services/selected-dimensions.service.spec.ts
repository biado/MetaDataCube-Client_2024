import { TestBed } from '@angular/core/testing';

import { SelectedDimensionsService } from './selected-dimensions.service';

describe('SelectedDimensionsService', () => {
  let service: SelectedDimensionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedDimensionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
