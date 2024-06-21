import { TestBed } from '@angular/core/testing';

import { GetCellsService } from './get-cells.service';

describe('GetCellsService', () => {
  let service: GetCellsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetCellsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
