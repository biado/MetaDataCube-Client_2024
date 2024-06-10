import { TestBed } from '@angular/core/testing';

import { GetTagsetListService } from './get-tagset-list.service';

describe('GetDimensionsService', () => {
  let service: GetTagsetListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetTagsetListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
