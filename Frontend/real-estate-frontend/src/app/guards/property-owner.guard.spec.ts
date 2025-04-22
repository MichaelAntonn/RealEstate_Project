import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { propertyOwnerGuard } from './property-owner.guard';

describe('propertyOwnerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => propertyOwnerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
