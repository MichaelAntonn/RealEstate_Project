import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyStatisticsComponent } from './company-statistics.component';

describe('CompanyStatisticsComponent', () => {
  let component: CompanyStatisticsComponent;
  let fixture: ComponentFixture<CompanyStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
