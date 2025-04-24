import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyNavbarComponent } from './company-navbar.component';

describe('CompanyNavbarComponent', () => {
  let component: CompanyNavbarComponent;
  let fixture: ComponentFixture<CompanyNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
