import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopCardsComponent } from './shop-cards.component';

describe('ShopCardsComponent', () => {
  let component: ShopCardsComponent;
  let fixture: ComponentFixture<ShopCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
