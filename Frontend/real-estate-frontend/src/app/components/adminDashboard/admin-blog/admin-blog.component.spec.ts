import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBlogComponent } from './admin-blog.component';

describe('AdminBlogComponent', () => {
  let component: AdminBlogComponent;
  let fixture: ComponentFixture<AdminBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
