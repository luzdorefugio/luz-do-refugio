import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartWidget } from './cart-widget';

describe('CartWidget', () => {
  let component: CartWidget;
  let fixture: ComponentFixture<CartWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
