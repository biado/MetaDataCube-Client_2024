import { TestBed } from '@angular/core/testing';

import { FindElement } from './find-element.service';

describe('FindElementinTagsetListService', () => {
  let service: FindElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FindElement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
