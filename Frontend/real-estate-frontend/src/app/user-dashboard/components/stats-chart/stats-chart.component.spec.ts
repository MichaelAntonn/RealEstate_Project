import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsChartComponent } from './stats-chart.component';

describe('StatsChartComponent', () => {
  let component: StatsChartComponent;
  let fixture: ComponentFixture<StatsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
