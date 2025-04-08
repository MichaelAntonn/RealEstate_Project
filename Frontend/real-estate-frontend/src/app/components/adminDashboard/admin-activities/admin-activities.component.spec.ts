import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminActivitiesComponent } from './admin-activities.component';

describe('AdminActivitiesComponent', () => {
  let component: AdminActivitiesComponent;
  let fixture: ComponentFixture<AdminActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminActivitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
