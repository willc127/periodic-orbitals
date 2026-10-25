import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Molecules } from './molecules';

describe('Molecules', () => {
  let component: Molecules;
  let fixture: ComponentFixture<Molecules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Molecules]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Molecules);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
