import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementProperties } from './element-properties';

describe('ElementProperties', () => {
  let component: ElementProperties;
  let fixture: ComponentFixture<ElementProperties>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementProperties]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElementProperties);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
