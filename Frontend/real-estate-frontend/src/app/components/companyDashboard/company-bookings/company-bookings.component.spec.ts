import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyBookingsComponent } from './company-bookings.component';

describe('CompanyBookingsComponent', () => {
  let component: CompanyBookingsComponent;
  let fixture: ComponentFixture<CompanyBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyBookingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
