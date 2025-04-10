import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RecentPropertiesComponent } from './recent-properties.component';

describe('RecentPropertiesComponent', () => {
  let component: RecentPropertiesComponent;
  let fixture: ComponentFixture<RecentPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentPropertiesComponent, CommonModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
