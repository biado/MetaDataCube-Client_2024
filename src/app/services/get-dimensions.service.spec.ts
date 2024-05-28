import { TestBed } from '@angular/core/testing';

import { GetDimensionsService } from './get-dimensions.service';

describe('GetDimensionsService', () => {
  let service: GetDimensionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetDimensionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
