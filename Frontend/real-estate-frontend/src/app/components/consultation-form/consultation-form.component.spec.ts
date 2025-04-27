import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationFormComponent } from './consultation-form.component';

describe('ConsultationFormComponent', () => {
  let component: ConsultationFormComponent;
  let fixture: ComponentFixture<ConsultationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
