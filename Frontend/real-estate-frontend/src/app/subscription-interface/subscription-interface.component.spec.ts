import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionInterfaceComponent } from './subscription-interface.component';

describe('SubscriptionInterfaceComponent', () => {
  let component: SubscriptionInterfaceComponent;
  let fixture: ComponentFixture<SubscriptionInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionInterfaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
