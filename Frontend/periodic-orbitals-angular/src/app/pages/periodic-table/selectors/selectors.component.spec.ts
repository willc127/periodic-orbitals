import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorsComponent } from './selectors.component';

describe('SelectorsComponent', () => {
  let component: SelectorsComponent;
  let fixture: ComponentFixture<SelectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
