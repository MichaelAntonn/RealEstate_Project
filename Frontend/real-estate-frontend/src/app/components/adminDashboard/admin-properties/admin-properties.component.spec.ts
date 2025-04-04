import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPropertiesComponent } from './admin-properties.component';

describe('AdminPropertiesComponent', () => {
  let component: AdminPropertiesComponent;
  let fixture: ComponentFixture<AdminPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
