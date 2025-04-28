import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealEstateBlogComponent } from './real-estate-blog.component';

describe('RealEstateBlogComponent', () => {
  let component: RealEstateBlogComponent;
  let fixture: ComponentFixture<RealEstateBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealEstateBlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealEstateBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
