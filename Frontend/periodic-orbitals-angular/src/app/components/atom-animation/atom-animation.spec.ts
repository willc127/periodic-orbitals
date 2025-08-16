import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtomAnimation } from './atom-animation';

describe('AtomAnimation', () => {
  let component: AtomAnimation;
  let fixture: ComponentFixture<AtomAnimation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtomAnimation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtomAnimation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
