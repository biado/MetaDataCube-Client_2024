import { TestBed } from '@angular/core/testing';

import { SelectedFiltersService } from './selected-filters.service';

describe('SelectedFiltersService', () => {
  let service: SelectedFiltersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedFiltersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
