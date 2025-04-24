import { TestBed } from '@angular/core/testing';

import { CompanyAuthService } from './company-auth.service';

describe('CompanyAuthService', () => {
  let service: CompanyAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
