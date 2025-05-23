import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyPropertiesComponent } from './company-properties.component';

describe('CompanyPropertiesComponent', () => {
  let component: CompanyPropertiesComponent;
  let fixture: ComponentFixture<CompanyPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
