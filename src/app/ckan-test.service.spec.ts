import { TestBed } from '@angular/core/testing';

import { CkanTestService } from './ckan-test.service';

describe('CkanTestService', () => {
  let service: CkanTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CkanTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
