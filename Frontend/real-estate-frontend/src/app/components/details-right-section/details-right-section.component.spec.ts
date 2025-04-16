import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsRightSectionComponent } from './details-right-section.component';

describe('DetailsRightSectionComponent', () => {
  let component: DetailsRightSectionComponent;
  let fixture: ComponentFixture<DetailsRightSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsRightSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsRightSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
