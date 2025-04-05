import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyCardsComponent } from './property-cards.component';

describe('PropertyCardsComponent', () => {
  let component: PropertyCardsComponent;
  let fixture: ComponentFixture<PropertyCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
