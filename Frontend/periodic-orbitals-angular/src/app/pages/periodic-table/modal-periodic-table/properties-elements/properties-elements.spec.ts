import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesElements } from './properties-elements';

describe('PropertiesElements', () => {
  let component: PropertiesElements;
  let fixture: ComponentFixture<PropertiesElements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesElements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesElements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
