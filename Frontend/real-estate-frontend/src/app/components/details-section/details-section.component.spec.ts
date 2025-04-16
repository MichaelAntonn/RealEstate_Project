import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsSectionComponent } from './details-section.component';

describe('DetailsSectionComponent', () => {
  let component: DetailsSectionComponent;
  let fixture: ComponentFixture<DetailsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
