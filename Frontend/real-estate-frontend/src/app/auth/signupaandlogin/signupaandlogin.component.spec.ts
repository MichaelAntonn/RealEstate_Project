import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupaandloginComponent } from './signupaandlogin.component';

describe('SignupaandloginComponent', () => {
  let component: SignupaandloginComponent;
  let fixture: ComponentFixture<SignupaandloginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupaandloginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupaandloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
