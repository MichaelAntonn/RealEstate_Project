import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyFilterComponent } from './property-filter.component';

describe('PropertyFilterComponent', () => {
  let component: PropertyFilterComponent;
  let fixture: ComponentFixture<PropertyFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
