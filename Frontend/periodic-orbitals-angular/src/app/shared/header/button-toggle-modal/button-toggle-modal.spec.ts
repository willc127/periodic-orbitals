import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonToggle } from './button-toggle-modal.component';

describe('ButtonToggle', () => {
  let component: ButtonToggle;
  let fixture: ComponentFixture<ButtonToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonToggle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
