import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemperatureSelector } from './temperature-selector';

describe('TemperatureSelector', () => {
  let component: TemperatureSelector;
  let fixture: ComponentFixture<TemperatureSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemperatureSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemperatureSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
