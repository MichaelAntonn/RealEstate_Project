import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsCounterComponent } from './stats-counter.component';

describe('StatsCounterComponent', () => {
  let component: StatsCounterComponent;
  let fixture: ComponentFixture<StatsCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCounterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
